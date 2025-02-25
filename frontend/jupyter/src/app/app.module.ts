import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

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

import { VolumeFormComponent } from './pages/volume-form/volume-form.component';
import { VolumeDetailsPageModule } from './pages/volume-details-page/volume-details-page.module';
import { ColumnsModule } from './pages/index/columns/columns.module';

import { ErrorStateMatcher } from '@angular/material/core';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import {
  MatSnackBarConfig,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';
import { IndexDefaultModule } from './pages/index/index-default/index-default.module';

/**
 * MAT_SNACK_BAR_DEFAULT_OPTIONS values can be found
 * here
 * https://github.com/angular/components/blob/main/src/material/snack-bar/snack-bar-config.ts#L25-L58
 */
const JwaSnackBarConfig: MatSnackBarConfig = {
  duration: 3000,
};

@NgModule({
  declarations: [AppComponent, VolumeFormComponent, PageNotFoundComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    KubeflowModule,
    NotebookPageModule,
    FormNewModule,
    ResourceTableModule,
    NamespaceSelectModule,
    ConfirmDialogModule,
    FormModule,
    VolumeDetailsPageModule,
    ColumnsModule,
    IndexDefaultModule,
  ],
  providers: [
    KubecostService,
    { provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: JwaSnackBarConfig },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
