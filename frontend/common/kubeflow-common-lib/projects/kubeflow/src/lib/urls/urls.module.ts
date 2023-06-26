import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { UrlsComponent } from './urls.component';

@NgModule({
  declarations: [UrlsComponent],
  imports: [CommonModule, RouterModule],
  exports: [UrlsComponent],
})
export class UrlsModule {}
