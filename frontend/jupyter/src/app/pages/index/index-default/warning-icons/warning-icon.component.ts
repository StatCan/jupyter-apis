import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';

@Component({
  selector: 'app-warning-icon',
  templateUrl: './warning-icon.component.html',
  styleUrls: ['./warning-icon.component.scss'],
})
export class WarningComponent implements TableColumnComponent {
  row: any;

  constructor() {}

  set element(elem: any) {
    this.row = elem;
  }

  public showWarnings() {
    //nworks with default. need to fix icon first. 
    if (this.row.hasOwnProperty('default')) {
      //console.log("I am at isOOMKilled");
      return this.row.default;
    }
    return false;
  }
}
