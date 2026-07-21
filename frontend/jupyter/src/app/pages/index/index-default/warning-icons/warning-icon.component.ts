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
      this.textToolTip = this.showWarningsText();
      console.log("I enter the verification", this.row);
      //The row never has warnings. 
      // this.row.warnings.forEach(warn => {
      //   if (warn == 'oomkilled') {
      //     this.textToolTip =
      //       '* ' + `Error Out Of Memory Killed.` + '\n';
      //   }
      //   if (warn == 'volumefull') {
      //     // Set the warning to be an array of string?
      //     this.textToolTip +=
      //       '* ' +
      //       `One or more of the volume(s) for ${this.row.name} is 95% or more full.` +
      //       '\n';
      //   }
      // });
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

    public showWarningsText() {
    //nworks with default. need to fix icon first.
    var thetext = '';
    if (this.row.hasOwnProperty('isOOMKilled')) {
      if (this.row.isOOMKilled) {
        thetext += '* ' + $localize`Error Out Of Memory Killed.` + '\n';
      }
    }
    return thetext;
  }
}
