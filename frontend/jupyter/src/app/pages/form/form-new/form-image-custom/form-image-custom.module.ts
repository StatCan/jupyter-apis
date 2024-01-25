import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModule as KfFormModule } from 'kubeflow';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormImageCustomComponent } from './form-image-custom.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [FormImageCustomComponent],
  imports: [
    CommonModule,
    KfFormModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
  ],
  exports: [FormImageCustomComponent],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, 
      useValue: {subscriptSizing: 'dynamic'}
    }
  ]
})
export class FormImageCustomModule {}
