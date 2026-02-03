import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'delay-dialog',
  templateUrl: 'delay-dialog.component.html',
})
export class DelayDialogComponent {

  constructor(
    public delaydialogRef: MatDialogRef<DelayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClicked(): void {
    this.delaydialogRef.close();
  }
}