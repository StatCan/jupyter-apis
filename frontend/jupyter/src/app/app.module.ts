import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IndexModule } from './pages/index/index.module';
import { FormModule } from './pages/form/form.module';
import { KubeflowModule } from 'kubeflow';
import { NamespaceService } from "./services/namespace.service"

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    KubeflowModule,
    IndexModule,
    FormModule,
  ],
  providers: [NamespaceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
