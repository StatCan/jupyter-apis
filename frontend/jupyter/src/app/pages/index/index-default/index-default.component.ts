import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@app/environment';
import {
  NamespaceService,
  ExponentialBackoff,
  ActionEvent,
  STATUS_TYPE,
  DialogConfig,
  ConfirmDialogService,
  SnackBarService,
  DIALOG_RESP,
  SnackType,
  StatusValue,
} from 'kubeflow';

import { JWABackendService } from 'src/app/services/backend.service';
import { KubecostService } from 'src/app/services/kubecost.service';
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
import { NotebookResponseObject, NotebookProcessedObject, VolumeResponseObject, VolumeProcessedObject, AggregateCostObject } from 'src/app/types';
import { Router } from '@angular/router';
import { Status } from '../../../types'
import { TranslateService } from '@ngx-translate/core';
import { AggregateCostResponse } from 'src/app/services/kubecost.service';

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
  pvcsWaitingViewer = new Set<string>();
  costConfig = defaultCostConfig;
  rawCostData: AggregateCostResponse = null;
  processedCostData: AggregateCostObject = null;

  constructor(
    public ns: NamespaceService,
    public backend: JWABackendService,
    public confirmDialog: ConfirmDialogService,
    public snackBar: SnackBarService,
    public router: Router,
    public translate: TranslateService,
    private kubecostService: KubecostService,
  ) {}

  ngOnInit(): void {
    this.poller = new ExponentialBackoff({ interval: 1000, retries: 3 });

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

        this.kubecostService.getAggregateCost(this.currNamespace).subscribe(
          aggCost => {
            if (!isEqual(this.rawCostData, aggCost)) {
              this.rawCostData = aggCost;

              this.processedCostData = this.processIncomingCostData(aggCost);
              this.poller.reset();
              }
            },
          err => {
            if (!isEqual(this.rawCostData, err)) {
              this.rawCostData = err;

              this.poller.reset();
            }
          });
      }),
    );

    // Reset the poller whenever the selected namespace changes
    this.subs.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        this.currNamespace = ns;
        this.poller.reset();
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.poller.stop();
  }

  // Event handling functions
  reactToAction(a: ActionEvent) {
    switch (a.action) {
      case 'newResourceButton': // TODO: could also use enums here
        this.newResourceClicked();
        break;
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

  public newResourceClicked() {
    // Redirect to form page
    this.router.navigate(['/new']);
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
        notebook.status.message = this.translate.instant('jupyter.index.prepareDeleteNotebook');
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
      this.translate.instant('jupyter.index.startingNotebookServer', {
        notebookName: notebook.name,
      }),
      SnackType.Info,
      3000,
    );

    notebook.status.phase = STATUS_TYPE.WAITING;
    notebook.status.message = this.translate.instant('startingNotebookServerMsg');
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
          this.translate.instant('jupyter.index.stoppingNotebookServer', {
            notebookName: notebook.name,
          }),
          SnackType.Info,
          3000,
        );

        notebook.status.phase = STATUS_TYPE.TERMINATING;
        notebook.status.message = this.translate.instant('prepareStopServer');
        this.updateNotebookFields(notebook);
      });
    });
  }

  // Data processing functions
  updateNotebookFields(notebook: NotebookProcessedObject) {
    notebook.deleteAction = this.processDeletionActionStatus(notebook);
    notebook.connectAction = this.processConnectActionStatus(notebook);
    notebook.startStopAction = this.processStartStopActionStatus(notebook);
  }

  processIncomingData(notebooks: NotebookResponseObject[]) {
    const notebooksCopy = JSON.parse(
      JSON.stringify(notebooks),
    ) as NotebookProcessedObject[];

    for (const nb of notebooksCopy) {
      this.updateNotebookFields(nb);
    }
    return notebooksCopy;
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
    const pvcsCopy = JSON.parse(JSON.stringify(pvcs)) as VolumeProcessedObject[];

    //Check which notebooks are mounted
    let mounts = Object.fromEntries(
      notebooks.flatMap(nb => nb.volumes.map(v => [v,nb]))
    );

    pvcsCopy.forEach(element => {
      if(mounts[element.name]){
        element.usedBy = mounts[element.name].name;
        element.status = {} as Status;
        element.status.message = "bound";
        element.status.phase = STATUS_TYPE.MOUNTED;
        element.status.key = {
					key: "jupyter.volumeTable.attached",
					params: null,
				};
      } else {
        element.status = {} as Status;
        element.status.message = "unbound";
        element.status.phase = STATUS_TYPE.UNMOUNTED;
        element.status.key = {
					key: "jupyter.volumeTable.unattached",
					params: null,
				};
      }
    });

    for (const pvc of pvcsCopy) {
      pvc.deleteAction = this.parseDeletionActionStatus(pvc);
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
        pvc.status.message = this.translate.instant('jupyter.volumeTable.prepareDeleteVolume');
        pvc.deleteAction = STATUS_TYPE.UNAVAILABLE;
        this.pvcsWaitingViewer.delete(pvc.name);
      });
    });
  }
  public costTrackByFn(index: number, cost: AggregateCostObject) {
    return `${cost.cpuCost}/${cost.gpuCost}/${cost.pvCost}/${cost.total}`;
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

  public processIncomingCostData(cost: AggregateCostResponse) {

    const resp = JSON.parse(
      JSON.stringify(cost),
    ) as AggregateCostResponse;

    let costCopy: AggregateCostObject = {};

    if (resp.data[this.currNamespace]) {
      costCopy.cpuCost = this.formatCost(resp.data[this.currNamespace].cpuCost + resp.data[this.currNamespace].ramCost);
      costCopy.gpuCost = this.formatCost(resp.data[this.currNamespace].gpuCost);
      costCopy.pvCost = this.formatCost(resp.data[this.currNamespace].pvCost);
      costCopy.total = this.formatCost(resp.data[this.currNamespace].totalCost);
    }

    return costCopy;
  }

  public formatCost(value: number): string {
    return "$" + (value > 0 ? Math.max(value, 0.01) : 0).toFixed(2)
  }

}
