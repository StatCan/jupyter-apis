import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewVolumeComponent } from './new.component';
import { VolumeNameModule } from './name/name.module';
import { StorageClassModule } from './storage-class/storage-class.module';
import { VolumeAccessModesModule } from './access-modes/access-modes.module';
import { VolumeSizeModule } from './size/size.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { EditorModule } from 'kubeflow';

@NgModule({
  declarations: [NewVolumeComponent],
  imports: [
    CommonModule,
    VolumeNameModule,
    StorageClassModule,
    VolumeAccessModesModule,
    VolumeSizeModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    EditorModule,
  ],
  exports: [NewVolumeComponent],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class NewVolumeModule {}
