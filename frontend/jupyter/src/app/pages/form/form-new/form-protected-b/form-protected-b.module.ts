import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModule as KfFormModule } from 'kubeflow';
import { FormProtectedBComponent } from './form-protected-b.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [FormProtectedBComponent],
  imports: [CommonModule, KfFormModule, MatCheckboxModule, MatIconModule],
  exports: [FormProtectedBComponent],
})
export class FormProtectedBModule {}
