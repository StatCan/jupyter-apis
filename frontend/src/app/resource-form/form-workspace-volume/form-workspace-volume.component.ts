import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Volume, SnackType } from "src/app/utils/types";
import { Subscription } from "rxjs";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-form-workspace-volume",
  templateUrl: "./form-workspace-volume.component.html",
  styleUrls: [
    "./form-workspace-volume.component.scss",
    "../resource-form.component.scss"
  ]
})
export class FormWorkspaceVolumeComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  private _readonly = false;

  @Input() parentForm: FormGroup;
  @Input() pvcs: Volume[];
  @Input() storageClasses: string[];
  @Input() defaultStorageClass: boolean;
  @Input()
  get readonly() {
    return this._readonly;
  }
  set readonly(b) {
    this._readonly = b;
  }

  constructor(
    private snackBar: SnackBarService,
    private translate: TranslateService) {}

  ngOnInit() {
    // Show a warning if no persistent storage is provided
    this.subscriptions.add(
      this.parentForm
        .get("noWorkspace")
        .valueChanges.subscribe((b: boolean) => {
          // close the snackbar if deselected
          if (!b) {
            this.snackBar.close();
          } else {
            const msg =
            this.translate.instant("formWorkspaceVolume.msgNoPersistent");
            this.snackBar.show(msg, SnackType.Warning, 0);
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.snackBar.close();
  }
}
