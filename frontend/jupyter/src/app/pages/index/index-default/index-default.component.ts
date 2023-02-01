import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@app/environment';
import {
  NamespaceService,
  ExponentialBackoff,
  ActionEvent,
  STATUS_TYPE,
  Status,
  DialogConfig,
  ConfirmDialogService,
  SnackBarService,
  DIALOG_RESP,
  SnackType,
  ToolbarButton,
} from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { KubecostService, AllocationCostResponse } from 'src/app/services/kubecost.service';
import { Subscription } from 'rxjs';
import {
  defaultConfig,
  defaultVolumeConfig,
  defaultCostConfig,
  getDeleteDialogConfig,
  getStopDialogConfig,
  getDeleteVolumeDialogConfig,
} from './config';
import { isEqual } from 'lodash';
import { NotebookResponseObject, 
  NotebookProcessedObject, 
  VolumeResponseObject, 
  VolumeProcessedObject,
  AllocationCostObject,
} from 'src/app/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index-default',
  templateUrl: './index-default.component.html',
  styleUrls: ['./index-default.component.scss'],
})
export class IndexDefaultComponent implements OnInit, OnDestroy {
  env = environment;
  poller: ExponentialBackoff;

  currNamespace = '';
  subs = new Subscription();

  config = defaultConfig;
  rawData: NotebookResponseObject[] = [];
  processedData: NotebookProcessedObject[] = [];

  volumeConfig= defaultVolumeConfig;
  rawVolumeData: VolumeResponseObject[] = [];
  processedVolumeData: VolumeProcessedObject[] = [];

  costConfig = defaultCostConfig;
  rawCostData: AllocationCostResponse = null;
  processedCostData: AllocationCostObject[] = [];
  costWindow = "today";
  kubecostPoller: ExponentialBackoff;
  kubecostSubs = new Subscription();

  kubecostLoading = false;

  buttons: ToolbarButton[] = [
    new ToolbarButton({
      text: $localize`New Notebook`,
      icon: 'add',
      stroked: true,
      fn: () => {
        this.router.navigate(['/new']);
      },
    }),
  ];

  constructor(
    public ns: NamespaceService,
    public backend: JWABackendService,
    public confirmDialog: ConfirmDialogService,
    public snackBar: SnackBarService,
    public router: Router,
    private kubecostService: KubecostService,
  ) {}

  ngOnInit(): void {
    this.poller = new ExponentialBackoff({ interval: 1000, retries: 3 });
    this.kubecostPoller = new ExponentialBackoff({ interval: 30000, retries: 1 });//30 second intervals

    // Poll for new data and reset the poller if different data is found
    this.subs.add(
      this.poller.start().subscribe(() => {
        if (!this.currNamespace) {
          return;
        }

        Promise.all([
          this.backend.getNotebooks(this.currNamespace).toPromise(),
          this.backend.getPVCs(this.currNamespace).toPromise()
        ]).then(([notebooks, pvcs]) => {
          if(
            !isEqual(notebooks, this.rawData) ||
            !isEqual(pvcs, this.rawVolumeData)
          ) {
            this.poller.reset();
          }

          this.rawData = notebooks;
          this.rawVolumeData = pvcs;

          this.processedData = this.processIncomingData(notebooks);
          this.processedVolumeData = this.parseIncomingData(pvcs, notebooks);
        })

      }),
    );

    // Reset the poller whenever the selected namespace changes
    this.subs.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        this.currNamespace = ns;
        this.poller.reset();
        this.kubecostPoller.reset();
      }),
    );

    // Poll for new kubecost data and reset the poller if different data is found
    this.kubecostSubs.add(
      this.kubecostPoller.start().subscribe(() => {
        if (!this.currNamespace) {
          return;
        }
        
        this.kubecostService.getAllocationCost(this.currNamespace, this.costWindow).subscribe(
          aggCost => {
            this.kubecostLoading = false;
            if (!isEqual(this.rawCostData, aggCost)) {
              this.rawCostData = aggCost;
              
              this.processedCostData = [this.processIncomingCostData(aggCost)];
              }
            },
          err => {
            this.kubecostLoading = false;
            if (!isEqual(this.rawCostData, err)) {
              this.rawCostData = err;
              this.kubecostPoller.reset();
            }
          });
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.kubecostSubs.unsubscribe();
    this.poller.stop();
    this.kubecostPoller.stop();
  }

  // Event handling functions
  reactToAction(a: ActionEvent) {
    switch (a.action) {
      case 'delete':
        this.deleteVolumeClicked(a.data);
        break;
      case 'connect':
        this.connectClicked(a.data);
        break;
      case 'start-stop':
        this.startStopClicked(a.data);
        break;
    }
  }

  public deleteVolumeClicked(notebook: NotebookProcessedObject) {
    const deleteDialogConfig = getDeleteDialogConfig(notebook.name);

    const ref = this.confirmDialog.open(notebook.name, deleteDialogConfig);
    const delSub = ref.componentInstance.applying$.subscribe(applying => {
      if (!applying) {
        return;
      }

      // Close the open dialog only if the DELETE request succeeded
      this.backend.deleteNotebook(this.currNamespace, notebook.name).subscribe({
        next: _ => {
          this.poller.reset();
          ref.close(DIALOG_RESP.ACCEPT);
        },
        error: err => {
          const errorMsg = err;
          deleteDialogConfig.error = errorMsg;
          ref.componentInstance.applying$.next(false);
        },
      });

      // DELETE request has succeeded
      ref.afterClosed().subscribe(res => {
        delSub.unsubscribe();
        if (res !== DIALOG_RESP.ACCEPT) {
          return;
        }

        notebook.status.phase = STATUS_TYPE.TERMINATING;
        notebook.status.message = 'Preparing to delete the Notebook...';
        this.updateNotebookFields(notebook);
      });
    });
  }

  public connectClicked(notebook: NotebookProcessedObject) {
    // Open new tab to work on the Notebook
    window.open(`/notebook/${notebook.namespace}/${notebook.name}/`);
  }

  public startStopClicked(notebook: NotebookProcessedObject) {
    if (notebook.status.phase === STATUS_TYPE.STOPPED) {
      this.startNotebook(notebook);
    } else {
      this.stopNotebook(notebook);
    }
  }

  public startNotebook(notebook: NotebookProcessedObject) {
    this.snackBar.open(
      $localize`Starting Notebook server '${notebook.name}'...`,
      SnackType.Info,
      3000,
    );

    notebook.status.phase = STATUS_TYPE.WAITING;
    notebook.status.message = 'Starting the Notebook Server...';
    this.updateNotebookFields(notebook);

    this.backend.startNotebook(notebook).subscribe(() => {
      this.poller.reset();
    });
  }

  public stopNotebook(notebook: NotebookProcessedObject) {
    const stopDialogConfig = getStopDialogConfig(notebook.name);
    const ref = this.confirmDialog.open(notebook.name, stopDialogConfig);
    const stopSub = ref.componentInstance.applying$.subscribe(applying => {
      if (!applying) {
        return;
      }

      // Close the open dialog only if the request succeeded
      this.backend.stopNotebook(notebook).subscribe({
        next: _ => {
          this.poller.reset();
          ref.close(DIALOG_RESP.ACCEPT);
        },
        error: err => {
          const errorMsg = err;
          stopDialogConfig.error = errorMsg;
          ref.componentInstance.applying$.next(false);
        },
      });

      // request has succeeded
      ref.afterClosed().subscribe(res => {
        stopSub.unsubscribe();
        if (res !== DIALOG_RESP.ACCEPT) {
          return;
        }

        this.snackBar.open(
          $localize`Stopping Notebook server '${notebook.name}'...`,
          SnackType.Info,
          3000,
        );

        notebook.status.phase = STATUS_TYPE.TERMINATING;
        notebook.status.message = $localize`Preparing to stop the Notebook Server...`;
        this.updateNotebookFields(notebook);
      });
    });
  }

  //gets internationalized status messageks based on status key message values from backend
  getStatusMessage(notebook: NotebookProcessedObject) {
    switch(notebook.status.key){
      case "notebookDeleting":
        return $localize`Deleting this notebook server`;
      case "noPodsRunning":
        return $localize`No Pods are currently running for this Notebook Server`;
      case "notebookStopping":
        return $localize`Notebook Server is stopping`;
      case "running":
        return $localize`Running`;
      case "waitingStatus":
        return $localize`Current status is waiting. Check 'kubectl describe pod' for more information`;
      case "errorEvent":
        return $localize`An error has occured. Check 'kubectl describe pod' for more information`;
      case "schedulingPod":
        return $localize`Scheduling the Pod`;
      default:
        return "";
    }
  }

  // Data processing functions
  updateNotebookFields(notebook: NotebookProcessedObject) {
    notebook.deleteAction = this.processDeletionActionStatus(notebook);
    notebook.connectAction = this.processConnectActionStatus(notebook);
    notebook.startStopAction = this.processStartStopActionStatus(notebook);
    notebook.status.message = this.getStatusMessage(notebook);
  }

  processIncomingData(notebooks: NotebookResponseObject[]) {
    const notebooksCopy = JSON.parse(
      JSON.stringify(notebooks),
    ) as NotebookProcessedObject[];

    for (const nb of notebooksCopy) {
      this.updateNotebookFields(nb);
      nb.protB = this.parseProtBNotebook(nb);
    }
    return notebooksCopy;
  }

  parseProtBNotebook(notebook: NotebookProcessedObject) {
    if(notebook.labels?.["notebook.statcan.gc.ca/protected-b"] === "true") {
      return true;
    }
    return false;
  }

  // Action handling functions
  processDeletionActionStatus(notebook: NotebookProcessedObject) {
    if (notebook.status.phase !== STATUS_TYPE.TERMINATING) {
      return STATUS_TYPE.READY;
    }

    return STATUS_TYPE.TERMINATING;
  }

  processStartStopActionStatus(notebook: NotebookProcessedObject) {
    // Stop button
    if (notebook.status.phase === STATUS_TYPE.READY) {
      return STATUS_TYPE.UNINITIALIZED;
    }

    // Start button
    if (notebook.status.phase === STATUS_TYPE.STOPPED) {
      return STATUS_TYPE.READY;
    }

    // If it is terminating, then the action should be disabled
    if (notebook.status.phase === STATUS_TYPE.TERMINATING) {
      return STATUS_TYPE.UNAVAILABLE;
    }

    // If the Notebook is not Terminating, then always allow the stop action
    return STATUS_TYPE.UNINITIALIZED;
  }

  processConnectActionStatus(notebook: NotebookProcessedObject) {
    if (notebook.status.phase !== STATUS_TYPE.READY) {
      return STATUS_TYPE.UNAVAILABLE;
    }

    return STATUS_TYPE.READY;
  }

  public notebookTrackByFn(index: number, notebook: NotebookProcessedObject) {
    return `${notebook.name}/${notebook.image}`;
  }

  public pvcTrackByFn(index: number, pvc: VolumeProcessedObject) {
    return `${pvc.name}/${pvc.namespace}/${pvc.size}`;
  }

  public parseIncomingData(pvcs: VolumeResponseObject[], notebooks: NotebookResponseObject[]) {
    let pvcsCopy = JSON.parse(JSON.stringify(pvcs)) as VolumeProcessedObject[];
    //Check which notebooks are mounted
    let mounts = Object.fromEntries(
      notebooks.flatMap(nb => nb.volumes.map(v => [v,nb]))
    );

    pvcsCopy = pvcsCopy.filter(pvc => pvc.labels?.["blob.aaw.statcan.gc.ca/automount"]==="true" ? false : true);

    pvcsCopy.forEach(element => {
      if(mounts[element.name]){
        element.usedBy = mounts[element.name].name;
        element.status = {} as Status;
        element.status.message = $localize`Attached`;
        element.status.phase = STATUS_TYPE.MOUNTED;
      } else {
        element.status = {} as Status;
        element.status.message = $localize`Unattached`;
        element.status.phase = STATUS_TYPE.UNMOUNTED;
      }
    });

    for (const pvc of pvcsCopy) {
      pvc.deleteAction = this.parseDeletionActionStatus(pvc);
      pvc.protB = this.parseProtBVolume(pvc);
    }

    return pvcsCopy;
  }

  // Status Terminating allows action to be enabled.
  // If there is a pvc in use, we want to block actions
  public parseDeletionActionStatus(pvc: VolumeProcessedObject) {
    if(pvc.usedBy != null) {
      return STATUS_TYPE.TERMINATING
    }
    return STATUS_TYPE.READY;

  }

  parseProtBVolume(pvc: VolumeProcessedObject) {
    if(pvc.labels?.["data.statcan.gc.ca/classification"] === "protected-b") {
      return true;
    }
    return false;
  }

  public reactVolumeToAction(a: ActionEvent) {
    switch (a.action) {
      case 'delete':
        this.deletePVCClicked(a.data);
        break;
    }
  }

  public deletePVCClicked(pvc: VolumeProcessedObject) {
    const deleteDialogConfig = getDeleteVolumeDialogConfig(pvc.name);

    const ref = this.confirmDialog.open(pvc.name, deleteDialogConfig);
    const delSub = ref.componentInstance.applying$.subscribe(applying => {
      if (!applying) {
        return;
      }

      // Close the open dialog only if the DELETE request succeeded
      this.backend.deletePVC(this.currNamespace, pvc.name).subscribe({
        next: _ => {
          this.poller.reset();
          ref.close(DIALOG_RESP.ACCEPT);
        },
        error: err => {
          // Simplify the error message
          const errorMsg = err;
          console.log(err);
          deleteDialogConfig.error = errorMsg;
          ref.componentInstance.applying$.next(false);
        },
      });

      // DELETE request has succeeded
      ref.afterClosed().subscribe(res => {
        delSub.unsubscribe();
        if (res !== DIALOG_RESP.ACCEPT) {
          return;
        }

        pvc.status.phase = STATUS_TYPE.TERMINATING;
        pvc.status.message = "Preparing to delete the Volume...";
        pvc.deleteAction = STATUS_TYPE.UNAVAILABLE;
      });
    });
  }

  public costWindowChanged(window: string) {
    this.costWindow = window;
    this.kubecostLoading = true;
    this.kubecostPoller.reset();
  }

  public costTrackByFn(index: number, cost: AllocationCostObject) {
    return `${cost.cpuCost}/${cost.gpuCost}/${cost.pvCost}/${cost.totalCost}`;
  }

  public getCostStatus() {
    if (this.rawCostData == null) {
      return;
    }
    if (this.rawCostData instanceof Error) {
      return false;
    }
    return true;
  }

  public processIncomingCostData(cost: AllocationCostResponse) {
    const resp = JSON.parse(
      JSON.stringify(cost),
    ) as AllocationCostResponse;

    let costCopy: AllocationCostObject = {
      cpuCost: this.formatCost(0),
      gpuCost: this.formatCost(0),
      pvCost: this.formatCost(0),
      totalCost: this.formatCost(0)
    };
    if (resp.data[0][this.currNamespace]) {
      costCopy.cpuCost = this.formatCost(resp.data[0][this.currNamespace].cpuCost + resp.data[0][this.currNamespace].ramCost);
      costCopy.gpuCost = this.formatCost(resp.data[0][this.currNamespace].gpuCost);
      costCopy.pvCost = this.formatCost(resp.data[0][this.currNamespace].pvCost);
      costCopy.totalCost = this.formatCost(resp.data[0][this.currNamespace].totalCost);
    }
    return costCopy;
  }

  public formatCost(value: number): string {
    return "$" + (value > 0 ? Math.max(value, 0.01) : 0).toFixed(2)
  }

}
