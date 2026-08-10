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

  public showWarnings(): boolean {
    return this.row?.isOOMKilled ? true : false;
  }

  public getWarningsText() {
    var thetext = '';
    if (this.row?.isOOMKilled) {
      thetext += '* ' + $localize`Error Out Of Memory Killed.` + '\n';
    }
    return thetext;
  }
}
