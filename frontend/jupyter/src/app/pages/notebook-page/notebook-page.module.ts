import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubeflowModule } from 'kubeflow';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NotebookPageComponent } from './notebook-page.component';
import { OverviewModule } from './overview/overview.module';
import { YamlModule } from './yaml/yaml.module';
import { LogsModule } from './logs/logs.module';
import { RouterModule } from '@angular/router';
import { EventsModule } from './events/events.module';

@NgModule({
  declarations: [NotebookPageComponent],
  imports: [
    CommonModule,
    KubeflowModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    OverviewModule,
    YamlModule,
    MatProgressSpinnerModule,
    LogsModule,
    RouterModule,
    EventsModule,
  ],
})
export class NotebookPageModule {}
