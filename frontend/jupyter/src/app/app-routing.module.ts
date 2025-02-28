import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormNewComponent } from './pages/form/form-new/form-new.component';
import { IndexDefaultComponent } from './pages/index/index-default/index-default.component';
import { NotebookPageComponent } from './pages/notebook-page/notebook-page.component';
import { VolumeDetailsPageComponent } from './pages/volume-details-page/volume-details-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', component: IndexDefaultComponent },
  { path: 'new', component: FormNewComponent },
  {
    path: 'notebook/details/:namespace/:notebookName',
    component: NotebookPageComponent,
  },
  {
    path: 'volume/details/:namespace/:pvcName',
    component: VolumeDetailsPageComponent,
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
