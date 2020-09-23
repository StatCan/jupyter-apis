import {Component, OnInit} from "@angular/core";
import {NamespaceService} from "../services/namespace.service";
import {KubernetesService} from "src/app/services/kubernetes.service";

import {Subscription} from "rxjs";
import {isEqual} from "lodash";
import {first} from "rxjs/operators";

import {ExponentialBackoff} from "src/app/utils/polling";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {Pvc, Volume, Resource} from "../utils/types";

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
    this.poller = new ExponentialBackoff({interval: 2000, retries: 3});
    const resourcesSub = this.poller.start().subscribe(() => {
      if (!this.currNamespace) {
        return;
      }

      Promise.all([
        this.k8s.getResource(this.currNamespace).toPromise(),
        this.k8s.getVolumes(this.currNamespace).toPromise()
      ]).then(([notebooks, volumes]) => {
        if (!isEqual(notebooks, this.resources) || !isEqual(volumes, this.pvcs)) {
          this.poller.reset();
        }
        this.resources = notebooks;
        this.pvcs = volumes;
        let mounts = Object.fromEntries(
          notebooks.flatMap(nb => nb.volumes.map(v => [v, nb]))
        );
        this.customPvcs = volumes.map(v => ({
          pvc: v,
          mountedBy: mounts[v.name]?.name
        }));
      });
    });

    // Keep track of the selected namespace
    const namespaceSub = this.ns.getSelectedNamespace().subscribe(namespace => {
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
        title: "You are about to delete the volume: " + p.pvc.name,
        message:
          "Are you sure you want to delete this volume? " +
          "This action can't be undone.",
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
          .subscribe(_ => {
            this.poller.reset();
          });
      });
  }
}
