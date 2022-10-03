import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeSizeComponent } from './size.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [VolumeSizeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  exports: [VolumeSizeComponent],
})
export class VolumeSizeModule {}
