import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IndexModule } from './pages/index/index.module';
import { 
  KubeflowModule,
  ImmediateErrorStateMatcher,
  ResourceTableModule,
  NamespaceSelectModule,
  ConfirmDialogModule,
  FormModule,
} from 'kubeflow';

import { HttpClientModule } from '@angular/common/http';
import { NotebookPageModule } from './pages/notebook-page/notebook-page.module';
import { FormNewModule } from './pages/form/form-new/form-new.module';
import { KubecostService } from './services/kubecost.service';

import { VolumeFormComponent } from './pages/volume-form/volume-form.component';
import { VolumeDetailsPageModule } from './pages/volume-details-page/volume-details-page.module';
import { ColumnsModule } from './pages/index/columns/columns.module';

import { ErrorStateMatcher } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    VolumeFormComponent,
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
    VolumeDetailsPageModule,
    ColumnsModule,

    ResourceTableModule,
    NamespaceSelectModule,
    ConfirmDialogModule,
    FormModule,
  ],
  providers: [
    KubecostService,
    { provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
