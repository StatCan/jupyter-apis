import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { DeleteButtonComponent } from './delete-button/delete-button.component';
import { IconModule, KubeflowModule, UrlsModule } from 'kubeflow';
import { UsedByComponent } from './used-by/used-by.component';

@NgModule({
  declarations: [DeleteButtonComponent, UsedByComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    IconModule,
    KubeflowModule,
    UrlsModule,
  ],
  exports: [DeleteButtonComponent, UsedByComponent],
})
export class ColumnsModule {}
