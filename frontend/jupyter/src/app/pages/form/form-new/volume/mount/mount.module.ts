import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeMountComponent } from './mount.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

@NgModule({
  declarations: [VolumeMountComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [VolumeMountComponent],
})
export class VolumeMountModule {}
