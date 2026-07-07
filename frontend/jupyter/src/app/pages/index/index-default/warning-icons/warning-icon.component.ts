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
      this.textToolTip = '';
      this.row.warnings.forEach(warn => {
        if (warn == 'oomkilled') {
          this.textToolTip =
            '* ' + $localize`Error Out Of Memory Killed.` + '\n';
        }
        if (warn == 'volumefull') {
          // Set the warning to be an array of string?
          this.textToolTip +=
            '* ' +
            $localize`One or more of the volume(s) for ${this.row.name} is 95% or more full.` +
            '\n';
        }
      });
    }
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
