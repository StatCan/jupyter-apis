import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { first } from "rxjs/operators";
import { isEqual } from "lodash";

import { NamespaceService } from "src/app/services/namespace.service";
import { KubernetesService } from "src/app/services/kubernetes.service";
import { Resource } from "src/app/utils/types";
import { ExponentialBackoff } from "src/app/utils/polling";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { KubecostService, AggregateCostResponse } from 'src/app/services/kubecost.service';

@Component({
  selector: "app-resource-table",
  templateUrl: "./resource-table.component.html",
  styleUrls: ["./resource-table.component.scss"]
})
export class ResourceTableComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  // Logic data
  aggregatedCost: AggregateCostResponse = null;
  resources = [];
  currNamespace = "";

  subscriptions = new Subscription();
  poller: ExponentialBackoff;

  // Table data
  displayedColumns: string[] = [
    "status",
    "name",
    "age",
    "image",
    "cpu",
    "memory",
    "volumes",
    "actions"
  ];
  dataSource = new MatTableDataSource();

  showNameFilter = false;

  constructor(
    private namespaceService: NamespaceService,
    private k8s: KubernetesService,
    private kubecostService: KubecostService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.sort = this.sort;

    // Create the exponential backoff poller
    this.poller = new ExponentialBackoff({ interval: 2000, retries: 3 });
    const resourcesSub = this.poller.start().subscribe(() => {
      // NOTE: We are using both the 'trackBy' feature in the Table for performance
      // and also detecting with lodash if the new data is different from the old
      // one. This is because, if the data changes we want to reset the poller
      if (!this.currNamespace) {
        return;
      }

      this.k8s.getResource(this.currNamespace).subscribe(resources => {
        if (!isEqual(this.resources, resources)) {
          this.resources = resources;
          this.dataSource.data = this.resources;
          this.poller.reset();
        }
      });
    });

    // Keep track of the selected namespace
    const namespaceSub = this.namespaceService
      .getSelectedNamespace()
      .subscribe(this.onNamespaceChange.bind(this));

    this.subscriptions.add(resourcesSub);
    this.subscriptions.add(namespaceSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onNamespaceChange(namespace: string) {
    this.currNamespace = namespace;
    this.dataSource.data = [];
    this.resources = [];
    this.poller.reset();
    this.getAggregatedCost();
  }

  formatCost(value: number): string {
    return '$' + (value > 0 ? Math.max(value, 0.01) : 0).toFixed(2)
  }

  getAggregatedCost() {
    this.kubecostService.getAggregateCost(this.currNamespace).subscribe(
      aggCost => this.aggregatedCost = aggCost
    )
  }

  // Resource (Notebook) Actions
  connectResource(rsrc: Resource): void {
    window.open(`/notebook/${rsrc.namespace}/${rsrc.name}/`);
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

  // Misc
  trackByFn(index: number, r: Resource) {
    return `${r.name}/${r.namespace}/${r.age}/${r.status}/${r.reason}`;
  }

  toggleFilter() {
    this.showNameFilter = !this.showNameFilter;
  }
}
