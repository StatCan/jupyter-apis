import { Component, OnInit } from '@angular/core';
import { environment } from '@app/environment';
import {
  RokService,
  NamespaceService,
  SnackBarService,
  ConfirmDialogService,
  PollerService,
} from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { Router } from '@angular/router';
import { IndexDefaultComponent } from '../index-default/index-default.component';
import { ActionsService } from 'src/app/services/actions.service';
import { KubecostService } from 'src/app/services/kubecost.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

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
    public snackBar: SnackBarService,
    public router: Router,
    public kubecostService: KubecostService,
    public poller: PollerService,
    public actions: ActionsService,
    public dialog: MatDialog,
  ) {
    super(
      ns,
      backend,
      confirmDialog,
      snackBar,
      router,
      kubecostService,
      poller,
      actions,
      dialog,
    );

    this.rok.initCSRF();
  }
}
