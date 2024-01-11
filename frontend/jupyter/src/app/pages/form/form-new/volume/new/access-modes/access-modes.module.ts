import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeAccessModesComponent } from './access-modes.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [VolumeAccessModesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    MatTooltipModule,
  ],
  exports: [VolumeAccessModesComponent],
})
export class VolumeAccessModesModule {}
