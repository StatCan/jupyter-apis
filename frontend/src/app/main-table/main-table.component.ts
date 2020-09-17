import { Component, OnInit } from "@angular/core";
import { NamespaceService } from "../services/namespace.service";
import { KubernetesService } from "src/app/services/kubernetes.service";

import { Subscription } from "rxjs";
import { isEqual } from "lodash";
import { first } from "rxjs/operators";

import { ExponentialBackoff } from "src/app/utils/polling";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { Pvc, Volume, Resource } from "../utils/types";


@Component({
  selector: "app-main-table",
  templateUrl: "./main-table.component.html",
  styleUrls: ["./main-table.component.scss"]
})
export class MainTableComponent implements OnInit {
  currNamespace = "";
  namespaces = [];
  resources = [];
  usedPVCs: Set<string> = new Set<string>();
  pvcs: Volume[] = [];
  customPvcs: Pvc[] = [];

  subscriptions = new Subscription();
  poller: ExponentialBackoff;

  constructor(
    public ns: NamespaceService,
    private k8s: KubernetesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.poller = new ExponentialBackoff({ interval: 2000, retries: 3 });
    const resourcesSub = this.poller.start().subscribe(() => {
      if (!this.currNamespace) {
        return;
      } 

      let getVolumes = this.k8s.getVolumes(this.currNamespace).toPromise().then(
       pvcs => {
        if(isEqual(this.pvcs, pvcs)){
          return;
        }
         this.pvcs = pvcs; 
       }
      ); 
      
      let getResource = this.k8s.getResource(this.currNamespace).toPromise().then(
        resources => {
        if (isEqual(this.resources, resources)){
          return;
        }
        this.resources = resources;
        this.usedPVCs.clear();
        this.resources.forEach(res => {this.usedPVCs.add(res.volumes.forEach(element => {this.usedPVCs.add(element);}))})  
      });
      
      Promise.all([getVolumes, getResource])
      .then(val => {
        this.customPvcs = [];
        this.pvcs.forEach(vol => {
          this.customPvcs.push({pvc:vol, ismounted:this.usedPVCs.has(vol.name)});
        });
      });
    });

    // Keep track of the selected namespace
    const namespaceSub = this.ns
      .getSelectedNamespace()
      .subscribe(namespace => {
        this.currNamespace = namespace;
        this.poller.reset();
      });

    this.subscriptions.add(resourcesSub);
    this.subscriptions.add(namespaceSub);
  }

  deleteResource(rsrc: Resource): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "fit-content",
      data: {
        title: "You are about to delete Notebook Server: " + rsrc.name,
        message:
          "Are you sure you want to delete this Notebook Server? " +
          "Your data might be lost if the Server is not backed by persistent storage.",
        yes: "delete",
        no: "cancel"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (!result || result !== "delete") {
          return;
        }

        this.k8s
          .deleteResource(rsrc.namespace, rsrc.name)
          .pipe(first())
          .subscribe(r => {
            this.poller.reset();
          });
      });
  }

  deletePvc(p: Pvc): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "fit-content",
      data: {
        title: "You are about to delete the PVC: " + p.pvc.name,
        message:
          "Are you sure you want to delete this Persistent Volume Claim? ",
        yes: "delete",
        no: "cancel"
      }
    });

    dialogRef
    .afterClosed()
    .pipe(first())
    .subscribe(result => {
      if (result !== "delete") {
        return;
      }

      this.k8s
        .deletePersistentStorageClaim(p.pvc.namespace, p.pvc.name)
        .pipe(first())
        .subscribe(r => {
          this.poller.reset();
        });
    });
  }

}
