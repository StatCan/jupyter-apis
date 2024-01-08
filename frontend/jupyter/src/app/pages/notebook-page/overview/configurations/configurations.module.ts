import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationsComponent } from './configurations.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import {
  ContentListItemModule,
  DetailsListModule,
  HeadingSubheadingRowModule,
  EditorModule,
} from 'kubeflow';
import { ConfigurationInfoDialogComponent } from './configuration-info-dialog/configuration-info-dialog.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [ConfigurationsComponent, ConfigurationInfoDialogComponent],
  imports: [
    CommonModule,
    DetailsListModule,
    ContentListItemModule,
    EditorModule,
    MatDialogModule,
    HeadingSubheadingRowModule,
    MatButtonModule,
  ],
  exports: [ConfigurationsComponent],
})
export class ConfigurationsModule {}
