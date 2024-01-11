import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModule as KfFormModule } from 'kubeflow';
import { FormAdvancedOptionsComponent } from './form-advanced-options.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

@NgModule({
  declarations: [FormAdvancedOptionsComponent],
  imports: [CommonModule, KfFormModule, MatSlideToggleModule],
  exports: [FormAdvancedOptionsComponent],
})
export class FormAdvancedOptionsModule {}
