import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DelayDialogConfig, DELAY_DIALOG_RESP } from '../types';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-delay-dialog',
  templateUrl: './delay-dialog.component.html',
  styleUrls: ['./delay-dialog.component.scss'],
})
export class DelayDialogComponent implements OnInit {
  public DELAY_DIALOG_RESP = DELAY_DIALOG_RESP;
  public isApplying = false;
  public applying$ = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<DelayDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: DelayDialogConfig,
  ) {}

  ngOnInit() {
    this.applying$.subscribe(b => {
      this.isApplying = b;
    });
  }

  onAcceptClicked(): void {
    this.isApplying = true;
    this.applying$.next(true);
  }

  onCancelClicked(): void {
    this.dialogRef.close(DELAY_DIALOG_RESP.CANCEL);
  }
}
