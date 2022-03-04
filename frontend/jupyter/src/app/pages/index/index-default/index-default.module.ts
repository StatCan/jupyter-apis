import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexDefaultComponent } from './index-default.component';
import {
  ResourceTableModule,
  NamespaceSelectModule,
  ConfirmDialogModule,
} from 'kubeflow';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [IndexDefaultComponent],
  imports: [
    CommonModule,
    ResourceTableModule,
    NamespaceSelectModule,
    ConfirmDialogModule,
    TranslateModule.forRoot(),
  ],
  exports: [
    IndexDefaultComponent,
    TranslateModule,
  ],
})
export class IndexDefaultModule {}
