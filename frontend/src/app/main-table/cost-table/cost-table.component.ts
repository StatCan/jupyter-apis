import { Component, Input } from "@angular/core";
import { AggregateCostResponse } from 'src/app/services/kubecost.service';

@Component({
  selector: "app-cost-table",
  templateUrl: "./cost-table.component.html",
  styleUrls: ["./cost-table.component.scss", "../main-table.component.scss"]
})
export class CostTableComponent{
  @Input() aggregatedCost: AggregateCostResponse; 
  @Input() currNamespace:string;

  formatCost(value: number): string {
    return '$' + (value > 0 ? Math.max(value, 0.01) : 0).toFixed(2)
  }

}
