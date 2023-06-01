import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@app/environment';
import {
  NamespaceService,
  ActionEvent,
  STATUS_TYPE,
  Status,
  ConfirmDialogService,
  SnackBarService,
  DIALOG_RESP,
  SnackType,
  ToolbarButton,
  PollerService,
  DashboardState,
} from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { KubecostService, AllocationCostResponse } from 'src/app/services/kubecost.service';
import { Subscription } from 'rxjs';
import {
  defaultConfig,
  defaultVolumeConfig,
  defaultCostConfig,
  getDeleteVolumeDialogConfig,
} from './config';
import { NotebookResponseObject, 
  NotebookProcessedObject, 
  PVCResponseObject, 
  PVCProcessedObject,
  AllocationCostObject,
} from 'src/app/types';
import { Router } from '@angular/router';
import { ActionsService } from 'src/app/services/actions.service';

@Component({
  selector: 'app-index-default',
  templateUrl: './index-default.component.html',
  styleUrls: ['./index-default.component.scss'],
})
export class IndexDefaultComponent implements OnInit, OnDestroy {
  env = environment;

  nsSub = new Subscription();
  pollSub = new Subscription();

  currNamespace: string | string[];
  config = defaultConfig;
  processedData: NotebookProcessedObject[] = [];
  dashboardDisconnectedState = DashboardState.Disconnected;

  volumeConfig= defaultVolumeConfig;
  rawVolumeData: PVCResponseObject[] = [];
  processedVolumeData: PVCProcessedObject[] = [];
  public pvcsWaitingViewer = new Set<string>();

  costConfig = defaultCostConfig;
  rawCostData: AllocationCostResponse = null;
  processedCostData: AllocationCostObject[] = [];
  costWindow = "today";
  kubecostPoller: ExponentialBackoff;
  kubecostSubs = new Subscription();

  kubecostLoading = false;

  private newNotebookButton = new ToolbarButton({
    text: $localize`New Notebook`,
    icon: 'add',
    stroked: true,
    fn: () => {
      this.router.navigate(['/new']);
    },
  });

  private newVolumeButton = new ToolbarButton({
    text: $localize`New Volume`,
    icon: 'add',
    stroked: true,
    fn: () => {
      this.newResourceClicked();
    },
  });

  buttons: ToolbarButton[] = [this.newNotebookButton, this.newVolumeButton];
  
  constructor(
    public ns: NamespaceService,
    public backend: JWABackendService,
    public confirmDialog: ConfirmDialogService,
    public snackBar: SnackBarService,
    public router: Router,
    private kubecostService: KubecostService,
    public poller: PollerService,
    public actions: ActionsService,
  ) {}

  ngOnInit(): void {
    // Reset the poller whenever the selected namespace changes
    this.nsSub = this.ns.getSelectedNamespace2().subscribe(ns => {
      this.currNamespace = ns;
      this.pvcsWaitingViewer = new Set<string>();
      this.poll(ns);
      this.newNotebookButton.namespaceChanged(ns, $localize`Notebook`);
      this.newVolumeButton.namespaceChanged(ns, $localize`Volume`);
    });
  }

  ngOnDestroy() {
    this.nsSub.unsubscribe();
    this.pollSub.unsubscribe();
  }

  public poll(ns: string | string[]) {
    this.pollSub.unsubscribe();
    this.processedData = [];
    this.processedVolumeData = [];

    const request = Promise.all([
      this.backend.getNotebooks(ns), 
      this.backend.getPVCs(ns),
      this.kubecostService.getAllocationCost(ns, this.costWindow)
    ])

    this.kubecostLoading = false;
    this.pollSub = this.poller.exponential(request).subscribe((notebooks, pvcs, aggCost) => {
      this.processedData = this.processIncomingData(notebooks);
      this.processedVolumeData = this.parseIncomingData(pvcs, notebooks);
      this.processedCostData = this.processIncomingCostData(aggCost);
    });
  }


  // Event handling functions
  reactToAction(a: ActionEvent) {
    switch (a.action) {
      case 'delete':
        this.deleteNotebookClicked(a.data);
        break;
      case 'connect':
        this.connectClicked(a.data);
        break;
      case 'start-stop':
        this.startStopClicked(a.data);
        break;
      case 'name:link':
        if (a.data.status.phase ==; STATUS_TYPE.TERMINATING) {
          a.event.stopPropagation();
          a.event.preventDefault();
          this.snackBar.open(
            'Notebook is being deleted, cannot show details.',
            SnackType.Info,
            4000,
          );
          return;
        }
        break;
    }
  }

  deleteNotebookClicked(notebook: NotebookProcessedObject) {
    this.actions
      .deleteNotebook(notebook.namespace, notebook.name)
      .subscribe(result => {
        if (result !== DIALOG_RESP.ACCEPT) {
          return;
        }

        notebook.status.phase = STATUS_TYPE.TERMINATING;
        notebook.status.message = 'Preparing to delete the Notebook...';
        this.updateNotebookFields(notebook);
      });
  }

  public connectClicked(notebook: NotebookProcessedObject) {
    this.actions.connectToNotebook(notebook.namespace, notebook.name);
  }

  public startStopClicked(notebook: NotebookProcessedObject) {
    if (notebook.status.phase === STATUS_TYPE.STOPPED) {
      this.startNotebook(notebook);
    } else {
      this.stopNotebook(notebook);
    }
  }

  public startNotebook(notebook: NotebookProcessedObject) {
    this.actions
      .startNotebook(notebook.namespace, notebook.name)
      .subscribe(_ => {
        notebook.status.phase = STATUS_TYPE.WAITING;
        notebook.status.message = 'Starting the Notebook Server...';
        this.updateNotebookFields(notebook);
      });
  }

  public stopNotebook(notebook: NotebookProcessedObject) {
    this.actions
      .stopNotebook(notebook.namespace, notebook.name)
      .subscribe(result => {
        if (result !== DIALOG_RESP.ACCEPT) {
          return;
        }

        notebook.status.phase = STATUS_TYPE.TERMINATING;
        notebook.status.message = $localize`Preparing to stop the Notebook Server...`;
        this.updateNotebookFields(notebook);
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
    notebook.link = {
      text: notebook.name,
      url: `/notebook/details/${notebook.namespace}/${notebook.name}`,
    };
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

  private updateButtons(): void {
    this.buttons = [this.newNotebookButton];
  }

  public pvcTrackByFn(index: number, pvc: PVCProcessedObject) {
    return `${pvc.name}/${pvc.namespace}/${pvc.capacity}`;
  }

  public parseIncomingData(pvcs: PVCResponseObject[], notebooks: NotebookResponseObject[]): PVCProcessedObject[] {
    const pvcsCopy = JSON.parse(JSON.stringify(pvcs)) as PVCProcessedObject[];

    //Check which notebooks are mounted
    let mounts = Object.fromEntries(
      notebooks.flatMap(nb => nb.volumes.map(v => [v,nb]))
    );
    
    //AAW: overwrite status field with our custom values
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
      pvc.ageValue = pvc.age.uptime;
      pvc.ageTooltip = pvc.age.timestamp;
      pvc.link = {
        text: pvc.name,
        url: `/volume/details/${pvc.namespace}/${pvc.name}`,
      };
    }

    return pvcsCopy;
  }

  // Status Terminating allows action to be enabled.
  // If there is a pvc in use, we want to block actions
  public parseDeletionActionStatus(pvc: PVCProcessedObject) {
    if(pvc.usedBy != null) {
      return STATUS_TYPE.TERMINATING
    }

    if (pvc.notebooks.length) {
      return STATUS_TYPE.UNAVAILABLE;
    }

    if (pvc.status.phase !== STATUS_TYPE.TERMINATING) {
      return STATUS_TYPE.READY;
    }

    return STATUS_TYPE.TERMINATING;
  }

  parseProtBVolume(pvc: PVCProcessedObject) {
    if(pvc.labels?.["data.statcan.gc.ca/classification"] === "protected-b") {
      return true;
    }
    return false;
  }

  public reactVolumeToAction(a: ActionEvent) {
    switch (a.action) {
      case 'delete':
        this.deleteVolumeClicked(a.data);
        break;
      case 'name:link':
        if (a.data.status.phase === STATUS_TYPE.TERMINATING) {
          a.event.stopPropagation();
          a.event.preventDefault();
          this.snackBar.open(
            'PVC is unavailable now.',
            SnackType.Warning,
            3000,
          );
          return;
        }
        break;
    }
  }

  // Functions for handling the action events
  public newResourceClicked() {
    const ref = this.dialog.open(FormDefaultComponent, {
      width: '600px',
      panelClass: 'form--dialog-padding',
    });

    ref.afterClosed().subscribe(res => {
      if (res === DIALOG_RESP.ACCEPT) {
        this.snackBar.open(
          $localize`Volume was submitted successfully.`,
          SnackType.Success,
          2000,
        );
        this.poll(this.currNamespace);
      }
    });
  }

  public deleteVolumeClicked(pvc: PVCProcessedObject) {
    this.actions.deleteVolume(pvc.name, pvc.namespace).subscribe(result => {
      if (result !== DIALOG_RESP.ACCEPT) {
        return;
      }

      pvc.status.phase = STATUS_TYPE.TERMINATING;
      pvc.status.message = 'Preparing to delete the Volume...';
      pvc.deleteAction = STATUS_TYPE.UNAVAILABLE;
      this.pvcsWaitingViewer.delete(pvc.name);
    });
  }

  public costWindowChanged(window: string) {
    this.costWindow = window;
    this.kubecostLoading = true;
    this.kubecostPoller.reset();
  }

  public costTrackByFn(index: number, cost: AllocationCostObject) {
    //AAW: Commented out shared cost
    //return `${cost.cpuCost}/${cost.gpuCost}/${cost.ramCost}/${cost.pvCost}/${cost.sharedCost}/${cost.totalCost}`;
    return `${cost.cpuCost}/${cost.gpuCost}/${cost.ramCost}/${cost.pvCost}/${cost.totalCost}`;
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
      ramCost: this.formatCost(0),
      pvCost: this.formatCost(0),
      sharedCost: this.formatCost(0),
      totalCost: this.formatCost(0)
    };

    const alloc = resp.data.sets[0].allocations[this.currNamespace];
    if (alloc) {
      costCopy.cpuCost = this.formatCost(alloc.cpuCost);
      costCopy.gpuCost = this.formatCost(alloc.gpuCost);
      costCopy.ramCost = this.formatCost(alloc.ramCost);
      costCopy.pvCost = this.formatCost(alloc.pvCost);
      //AAW: Commented out shared cost
      //costCopy.sharedCost = this.formatCost(alloc.sharedCost);
      //costCopy.totalCost = this.formatCost(alloc.cpuCost
      //  +alloc.gpuCost
      //  +alloc.ramCost
      //  +alloc.pvCost
      //  +alloc.sharedCost
      //);
      costCopy.totalCost = this.formatCost(
        alloc.cpuCost
        +alloc.gpuCost
        +alloc.ramCost
        +alloc.pvCost
      );
    }
    
    return [costCopy];
  }

  public formatCost(value: number): string {
    return "$" + value.toFixed(2)
  }

}
