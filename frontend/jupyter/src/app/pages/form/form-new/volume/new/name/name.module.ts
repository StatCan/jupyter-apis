import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeNameComponent } from './name.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FormModule } from 'kubeflow';

@NgModule({
  declarations: [VolumeNameComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    FormModule,
  ],
  exports: [VolumeNameComponent],
})
export class VolumeNameModule {}
