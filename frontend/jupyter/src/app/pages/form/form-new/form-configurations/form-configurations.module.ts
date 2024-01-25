import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModule as KfFormModule } from 'kubeflow';
import { FormConfigurationsComponent } from './form-configurations.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [FormConfigurationsComponent],
  imports: [
    CommonModule,
    KfFormModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
  ],
  exports: [FormConfigurationsComponent],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, 
      useValue: {subscriptSizing: 'dynamic'}
    }
  ]
})
export class FormConfigurationsModule {}
