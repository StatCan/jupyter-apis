import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';

@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss'],
})
export class UsageComponent implements TableColumnComponent {
  private data: any;

  set element(data: any) {
    this.data = data;
  }
  get element() {
    return this.data;
  }

  getDisplayedElement(): string {
    let roundedVal = Math.ceil(parseFloat(this.element.usage));
    return !isNaN(roundedVal) ? roundedVal.toString() + '%' : '';
  }

  constructor() {}

  isUsageWarning(): boolean {
    let roundedVal = Math.ceil(parseFloat(this.element.usage));
    return !isNaN(roundedVal) ? roundedVal > 95 : false;
  }

  getWarningTooltipMessage(): string {
    return $localize`Caution; this volume is more than 95% full.`;
  }
}
