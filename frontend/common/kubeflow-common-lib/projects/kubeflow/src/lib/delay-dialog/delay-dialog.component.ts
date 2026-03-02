import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DelayDialogConfig, DELAY_DIALOG_RESP } from './types';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'lib-delay-dialog',
  templateUrl: 'delay-dialog.component.html',
})
export class DelayDialogComponent implements OnInit {
  public DELAY_DIALOG_RESP = DELAY_DIALOG_RESP;
  formDelayCtrl: FormGroup;
  @Input() hourControl: FormControl<number | string>;

  constructor(
    public delaydialogRef: MatDialogRef<DelayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DelayDialogConfig,
  ) {}

  ngOnInit() {
    const fb = new FormBuilder();

    this.formDelayCtrl = fb.group({
      hourControl: [
        '1',
        [
          Validators.min(0),
          Validators.max(72),
          Validators.pattern('^([1-9]|[1-6]d|7[0-2])$'),
        ],
      ],
    });
  }

  onCancelClicked(): void {
    this.delaydialogRef.close({ status: DELAY_DIALOG_RESP.CANCEL });
  }
  onOkClicked(): void {
    const h = this.formDelayCtrl.get('hourControl').value.toString();
    this.delaydialogRef.close({ status: DELAY_DIALOG_RESP.ACCEPT, hours: h });
  }
  onNoClick(): void {
    this.onCancelClicked();
  }

  getDelayError(key: string) {
    let e: any;
    const errs = this.formDelayCtrl.get(key).errors || {};

    if (errs.required) {
      return $localize`Specify an amount of hours for the delay`;
    }
    if ((e = errs.pattern)) {
      return $localize`Specify a full amount of hours for the delay`;
    }

    if ((e = errs.min)) {
      return $localize`Specify at least ${e.min} hours`;
    }

    if ((e = errs.max)) {
      return $localize`Can't exceed ${e.max} hours`;
    }
  }
}
