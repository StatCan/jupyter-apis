import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';

@Component({
  selector: 'app-protb-icon',
  templateUrl: './protb-icon.component.html',
  styleUrls: ['./protb-icon.component.scss'],
})
export class ProtBComponent implements TableColumnComponent {
  row: any;

  constructor() {}

  set element(elem: any) {
    this.row = elem;
  }

  public isProtectedB() {
    if (this.row.hasOwnProperty('protB')) {
      return this.row.protB;
    }
    return false;
  }
}
