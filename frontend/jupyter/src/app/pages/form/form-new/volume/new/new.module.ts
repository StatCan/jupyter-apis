import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewVolumeComponent } from './new.component';
import { VolumeNameModule } from './name/name.module';
import { StorageClassModule } from './storage-class/storage-class.module';
import { VolumeAccessModesModule } from './access-modes/access-modes.module';
import { VolumeSizeModule } from './size/size.module';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { RokUrlModule } from './rok-url/rok-url.module';
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
    RokUrlModule,
    EditorModule,
  ],
  exports: [NewVolumeComponent],
})
export class NewVolumeModule {}
