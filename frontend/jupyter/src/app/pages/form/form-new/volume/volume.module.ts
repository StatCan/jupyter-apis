import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ExistingVolumeModule } from './existing/existing-volume.module';
import { VolumeMountModule } from './mount/mount.module';
import { NewVolumeModule } from './new/new.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ExistingVolumeModule,
    VolumeMountModule,
    NewVolumeModule,
  ],
  exports: [ExistingVolumeModule, VolumeMountModule, NewVolumeModule],
})
export class VolumeModule {}
