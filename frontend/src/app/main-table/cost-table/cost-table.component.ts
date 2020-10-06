import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { isEqual } from "lodash";

import { NamespaceService } from "src/app/services/namespace.service";
import { KubernetesService } from "src/app/services/kubernetes.service";
import { ExponentialBackoff } from "src/app/utils/polling";
import { KubecostService, AggregateCostResponse } from 'src/app/services/kubecost.service';

@Component({
  selector: "app-cost-table",
  templateUrl: "./cost-table.component.html",
  styleUrls: ["./cost-table.component.scss"]
})
export class CostTableComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  // Logic data
  aggregatedCost: AggregateCostResponse = null;
  resources = [];
  currNamespace = "";

  subscriptions = new Subscription();
  poller: ExponentialBackoff;

  dataSource = new MatTableDataSource();

  constructor(
    private namespaceService: NamespaceService,
    private k8s: KubernetesService,
    private kubecostService: KubecostService,
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
}
