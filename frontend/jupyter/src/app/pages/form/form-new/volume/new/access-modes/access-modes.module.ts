import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeAccessModesComponent } from './access-modes.component';
import { ReactiveFormsModule } from '@angular/forms';

import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class VolumeAccessModesModule {}
