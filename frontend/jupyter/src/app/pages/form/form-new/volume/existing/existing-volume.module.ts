import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExistingVolumeComponent } from './existing-volume.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { ExistingPvcModule } from './pvc/pvc.module';
import { EditorModule } from 'kubeflow';

@NgModule({
  declarations: [ExistingVolumeComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    ExistingPvcModule,
    EditorModule,
  ],
  exports: [ExistingVolumeComponent],
})
export class ExistingVolumeModule {}
