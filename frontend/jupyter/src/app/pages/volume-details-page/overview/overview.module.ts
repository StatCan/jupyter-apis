import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { ContentListItemModule, KubeflowModule, UrlsModule } from 'kubeflow';
import { LinkGroupsTableModule } from './link-groups-table/link-groups-table.module';

@NgModule({
  declarations: [OverviewComponent],
  imports: [
    CommonModule,
    KubeflowModule,
    ContentListItemModule,
    LinkGroupsTableModule,
    UrlsModule,
  ],
  exports: [OverviewComponent],
})
export class OverviewModule {}
