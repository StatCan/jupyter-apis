import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Volume } from 'src/app/types';
import { SnackBarService, SnackType } from 'kubeflow';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rok-form-workspace-volume',
  templateUrl: './rok-form-workspace-volume.component.html',
  styleUrls: ['./rok-form-workspace-volume.component.scss'],
})
export class RokFormWorkspaceVolumeComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();

  @Input() parentForm: FormGroup;
  @Input() readonly: boolean;
  @Input() pvcs: Volume[];
  @Input() storageClasses: string[];
  @Input() token: string;

  constructor(
    private snackBar: SnackBarService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    // Show a warning if no persistent storage is provided
    this.subscriptions.add(
      this.parentForm
        .get('noWorkspace')
        .valueChanges.subscribe((b: boolean) => {
          // close the snackbar if deselected
          if (!b) {
            this.snackBar.close();
          } else {
            const msg = this.translate.instant(
              'jupyter.formWorkspaceVolume.msgNoPersistent',
            );
            this.snackBar.open(msg, SnackType.Warning, 0);
          }
        }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
