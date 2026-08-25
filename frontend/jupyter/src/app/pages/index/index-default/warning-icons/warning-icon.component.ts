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

  public showWarnings(): boolean {
    return this.getWarningsText() !== '' ? true : false;
  }

  public getWarningsText() {
    var thetext = '';
    if (this.row?.isOOMKilled) {
      thetext += '* ' + $localize`Error Out Of Memory Killed.` + '\n';
    }
    if (this.row?.fullVolumes && this.row.fullVolumes.length > 0) {
      thetext += '* ' + $localize`One or more volumes is full.` + '\n';
    }
    return thetext;
  }
}
