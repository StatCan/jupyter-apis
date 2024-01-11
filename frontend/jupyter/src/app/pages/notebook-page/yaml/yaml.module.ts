import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YamlComponent } from './yaml.component';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { EditorModule, KubeflowModule } from 'kubeflow';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [YamlComponent],
  imports: [
    CommonModule,
    EditorModule,
    MatTabsModule,
    KubeflowModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  exports: [YamlComponent],
})
export class YamlModule {}
