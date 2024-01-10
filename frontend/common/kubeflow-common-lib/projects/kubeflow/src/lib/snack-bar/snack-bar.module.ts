import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { SnackBarComponent } from './component/snack-bar.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  declarations: [SnackBarComponent],
})
export class SnackBarModule {}
