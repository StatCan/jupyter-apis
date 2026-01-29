import { Injectable } from '@angular/core';
import { DelayDialogModule } from './delay-dialog.module';
import { MatDialog } from '@angular/material/dialog';
import { DelayDialogComponent } from './dialog/delay-dialog.component';
import { DelayDialogConfig } from './types';

@Injectable({
  providedIn: DelayDialogModule,
})
export class DelayDialogService {
  constructor(private dialog: MatDialog) {}

  public open(rsrcName: string, config: DelayDialogConfig) {
    return this.dialog.open(DelayDialogComponent, {
      width: config.width || 'fit-content',
      data: config,
    });
  }
}
