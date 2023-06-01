import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorStateMatcher } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IndexModule } from './pages/index/index.module';
import { 
  KubeflowModule,
  ResourceTableModule,
  NamespaceSelectModule,
  ConfirmDialogModule,
  FormModule,
  ImmediateErrorStateMatcher,
} from 'kubeflow';

import { HttpClientModule } from '@angular/common/http';
import { NotebookPageModule } from './pages/notebook-page/notebook-page.module';
import { FormNewModule } from './pages/form/form-new/form-new.module';
import { KubecostService } from './services/kubecost.service';

import { IndexComponent } from './pages/index/index.component';
import { VolumeFormComponent } from './pages/volume-form/volume-form.component';
import { IndexDefaultComponent } from './pages/index/index-default/index-default.component';
import { IndexRokComponent } from './pages/index/index-rok/index-rok.component';

import { VolumeDetailsPageModule } from './pages/volume-details-page/volume-details-page.module';
import { ColumnsModule } from './pages/index/columns/columns.module';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    VolumeFormComponent,
    IndexDefaultComponent,
    IndexRokComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    KubeflowModule,
    IndexModule,
    NotebookPageModule,
    FormNewModule,
    ResourceTableModule,
    NamespaceSelectModule,
    ConfirmDialogModule,
    FormModule,
    VolumeDetailsPageModule,
    ColumnsModule,
  ],
  providers: [KubecostService, { provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher },],
  bootstrap: [AppComponent],
})
export class AppModule {}
