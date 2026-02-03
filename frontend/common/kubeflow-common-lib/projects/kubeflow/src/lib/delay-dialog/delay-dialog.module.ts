import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { DelayDialogComponent } from './delay-dialog.component';

@NgModule({
  declarations: [DelayDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogClose,
  ],
})
export class DelayDialogModule {}