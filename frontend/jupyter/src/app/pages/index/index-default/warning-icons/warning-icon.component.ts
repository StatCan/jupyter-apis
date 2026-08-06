import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';

@Component({
  selector: 'app-warning-icon',
  templateUrl: './warning-icon.component.html',
  styleUrls: ['./warning-icon.component.scss'],
})
export class WarningComponent implements TableColumnComponent {
  row: any;
  textToolTip = '';

  constructor() {}

  set element(elem: any) {
    this.row = elem;
    if (this.showWarnings()) {
      this.textToolTip = this.getWarningsText();
    }
  }

  public showWarnings() {
    var isWarnings = false;
    if (this.row.hasOwnProperty('isOOMKilled')) {
      isWarnings = this.row.isOOMKilled;
      if (this.row.isOOMKilled) {
        return true;
      }
    }
    return isWarnings;
  }

  public getWarningsText() {
    var thetext = '';
      if (this.row?.isOOMKilled) {
        thetext += '* ' + $localize`Error Out Of Memory Killed.` + '\n';
    }
    return thetext;
  }
}
