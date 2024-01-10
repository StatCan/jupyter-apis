import { Injectable } from '@angular/core';
import { ConfirmDialogModule } from './confirm-dialog.module';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmDialogComponent } from './dialog/dialog.component';
import { DialogConfig } from './types';

@Injectable({
  providedIn: ConfirmDialogModule,
})
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  public open(rsrcName: string, config: DialogConfig) {
    return this.dialog.open(ConfirmDialogComponent, {
      width: config.width || 'fit-content',
      data: config,
    });
  }
}
