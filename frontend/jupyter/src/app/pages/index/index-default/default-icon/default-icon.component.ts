import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';

@Component({
  selector: 'app-default-icon',
  templateUrl: './default-icon.component.html',
  styleUrls: ['./default-icon.component.scss'],
})
export class DefaultComponent implements TableColumnComponent {
  row: any;

  constructor() {}

  set element(elem: any) {
    this.row = elem;
  }

  public isDefaultNotebook() {
    if (this.row.hasOwnProperty('default')) {
      return this.row.default;
    }
    return false;
  }
}
