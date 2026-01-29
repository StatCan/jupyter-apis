import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'delay-dialog',
  templateUrl: 'delay-dialog.component.html',
})
export class DelayDialogComponent {

  constructor(
    public delaydialogRef: MatDialogRef<DelayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancel(): void {
    this.delaydialogRef.close();
  }

}