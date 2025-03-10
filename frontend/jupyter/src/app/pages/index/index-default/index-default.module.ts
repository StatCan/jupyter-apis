import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexDefaultComponent } from './index-default.component';
import { KubeflowModule } from 'kubeflow';
import { DefaultComponent } from './default-icon/default-icon.component';
import { ServerTypeComponent } from './server-type/server-type.component';

@NgModule({
  declarations: [IndexDefaultComponent, ServerTypeComponent, DefaultComponent],
  imports: [CommonModule, KubeflowModule],
  exports: [IndexDefaultComponent, ServerTypeComponent, DefaultComponent],
})
export class IndexDefaultModule {}
