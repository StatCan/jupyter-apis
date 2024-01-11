import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeSizeComponent } from './size.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [VolumeSizeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  exports: [VolumeSizeComponent],
})
export class VolumeSizeModule {}
