import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DelayDialogConfig, DELAY_DIALOG_RESP } from './types';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'delay-dialog',
  templateUrl: 'delay-dialog.component.html',
})
export class DelayDialogComponent implements OnInit{
  public DELAY_DIALOG_RESP = DELAY_DIALOG_RESP;
  private hours: '';
  formDelayCtrl: FormGroup;
  @Input() MIN_DELAY = 1;
  @Input() MAX_DELAY = 72;
  @Input() hourControl: FormControl<number | string>;

  constructor(public delaydialogRef: MatDialogRef<DelayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DelayDialogConfig) { }

  ngOnInit() {
    const fb = new FormBuilder();

    this.formDelayCtrl = fb.group({
      hourControl: [ '1', [Validators.min(0), Validators.max(12)]]
    });

  }

  onCancelClicked(): void {
    this.delaydialogRef.close({ status: DELAY_DIALOG_RESP.CANCEL, hours: 3 });
  }
  onOkClicked(): void {
    const h = this.formDelayCtrl.get("hourControl").value;
    this.delaydialogRef.close({ status: DELAY_DIALOG_RESP.ACCEPT, hours: h});
  }
  onNoClick(): void {
    this.onCancelClicked();
  }
}