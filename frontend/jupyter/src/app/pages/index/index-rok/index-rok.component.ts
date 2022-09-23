import { Component, OnInit } from '@angular/core';
import { environment } from '@app/environment';
import {
  RokService,
  NamespaceService,
  SnackBarService,
  ConfirmDialogService,
} from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { KubecostService } from 'src/app/services/kubecost.service'
import { Router } from '@angular/router';
import { IndexDefaultComponent } from '../index-default/index-default.component';

@Component({
  selector: 'app-index-rok',
  templateUrl: '../index-default/index-default.component.html',
  styleUrls: ['../index-default/index-default.component.scss'],
})
export class IndexRokComponent extends IndexDefaultComponent implements OnInit {
  constructor(
    private rok: RokService,
    public ns: NamespaceService,
    public backend: JWABackendService,
    public confirmDialog: ConfirmDialogService,
    public popup: SnackBarService,
    public router: Router,
    public cost: KubecostService,
  ) {
    super(ns, backend, confirmDialog, popup, router, cost);

    this.rok.initCSRF();
  }
}
