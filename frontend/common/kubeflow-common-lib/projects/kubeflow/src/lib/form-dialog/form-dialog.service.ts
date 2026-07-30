import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogConfig } from './types';
import { FormDialogModule } from './form-dialog.module';
import { FormDialogComponent } from './dialog/form-dialog.component';

@Injectable({
  providedIn: FormDialogModule,
})
export class FormDialogService {
  constructor(private dialog: MatDialog) {}

  public open(config: FormDialogConfig) {
    return this.dialog.open(FormDialogComponent, {
      width: config.width || 'fit-content',
      data: config,
    });
  }
}
