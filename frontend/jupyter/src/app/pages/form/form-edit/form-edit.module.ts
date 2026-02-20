import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  FormModule as KfFormModule,
  TitleActionsToolbarModule,
  LoadingSpinnerModule,
} from 'kubeflow';
import { FormCpuRamModule } from '../form-new/form-cpu-ram/form-cpu-ram.module';
import { FormWorkspaceVolumeModule } from '../form-new/form-workspace-volume/form-workspace-volume.module';
import { FormDataVolumesModule } from '../form-new/form-data-volumes/form-data-volumes.module';
import { FormEditComponent } from './form-edit.component';

@NgModule({
  declarations: [FormEditComponent],
  imports: [
    CommonModule,
    KfFormModule,
    MatIconModule,
    TitleActionsToolbarModule,
    LoadingSpinnerModule,
    FormWorkspaceVolumeModule,
    FormCpuRamModule,
    FormDataVolumesModule,
  ],
  exports: [FormEditComponent],
})
export class FormEditModule {}
