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
    return this.row?.isOOMKilled || this.row?.hasFullVolumes ? true : false;
  }

  public getWarningsText() {
    var text = $localize`Potential issues with this notebook server:\n`;
    if (this.row?.isOOMKilled) {
      text += $localize`* Last restarted because of an Out-Of-Memory error.\n`;
    }

    if (this.row?.hasFullVolumes) {
      text += $localize`* One or more attached volumes are full.\n`;
    }
    return text;
  }
}
