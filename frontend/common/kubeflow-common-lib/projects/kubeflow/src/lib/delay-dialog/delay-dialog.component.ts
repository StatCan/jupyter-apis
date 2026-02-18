import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DelayDialogConfig, DELAY_DIALOG_RESP } from './types';

@Component({
  selector: 'delay-dialog',
  templateUrl: 'delay-dialog.component.html',
})
export class DelayDialogComponent {
  public DELAY_DIALOG_RESP = DELAY_DIALOG_RESP;
  constructor(
    
    public delaydialogRef: MatDialogRef<DelayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DelayDialogConfig) { }

  onCancelClicked(): void {
    this.delaydialogRef.close({ status: DELAY_DIALOG_RESP.CANCEL, hours: 0 });
  }
  onOkClicked(): void {
    this.delaydialogRef.close({ status: DELAY_DIALOG_RESP.ACCEPT, hours: this.data.hours});
  }
  onNoClick(): void {
    this.onCancelClicked();
  }
}