import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { Volume } from "src/app/utils/types";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { NamespaceService } from "src/app/services/namespace.service";
import { KubernetesService } from "src/app/services/kubernetes.service";
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
  selector: "app-volume",
  templateUrl: "./volume.component.html",
  styleUrls: ["./volume.component.scss"]
})
export class VolumeComponent implements OnInit, OnDestroy {
  private _notebookName = "";
  private _defaultStorageClass: boolean;
  private mountedVolumes: Set<string> = new Set<string>();

  currentPVC: Volume;
  existingPVCs: Set<string> = new Set();
  // Specific error matcher for volume name field
  matcher = new PvcErrorStateMatcher();

  subscriptions = new Subscription();

  // ----- @Input Parameters -----
  @Input() volume: FormGroup;
  @Input() namespace: string;
  @Input() sizes: Set<string>;

  @Input()
  get notebookName() {
    return this._notebookName;
  }
  set notebookName(nm: string) {
    if (!this.volume.disabled) {
      this.notebookNameChanged(nm);
    }
  }

  @Input()
  set ephemeral(b: boolean) {
    if (!this.volume.disabled) {
      this.storageOptionChanged(b);
    }
  }

  @Input()
  set pvcs(data) {
    if (!this.volume.disabled) {
      this.pvcsChanged(data);
    }
  }

  @Input()
  get defaultStorageClass() {
    return this._defaultStorageClass;
  }
  set defaultStorageClass(s: boolean) {
    // Update the current pvc type
    this._defaultStorageClass = s;

    if (!this.volume.disabled) {
      this.updateVolInputFields();
    }
  }

  // ----- Get macros -----
  get selectedVolIsExistingType(): boolean {
    return (
      this.existingPVCs.has(this.volume.value.name) || !this.defaultStorageClass
    );
  }

  get currentVolName(): string {
    return this.renderVolName(this.volume.get("templatedName").value);
  }

  // ----- utility functions -----
  renderVolName(name: string): string {
    return name.replace("{notebook-name}", this.notebookName);
  }

  setVolumeType(type: string) {
    if (type === "Existing") {
      this.volume.controls.size.disable();
      this.volume.controls.mode.disable();
    } else {
      this.volume.controls.size.enable();
      this.volume.controls.mode.enable();
    }
  }

  updateVolInputFields(): void {
    // Disable input fields according to volume type
    if (this.selectedVolIsExistingType) {
      // Disable all fields
      this.volume.controls.size.disable();
      this.volume.controls.mode.disable();
      this.volume.controls.type.setValue("Existing");
    } else {
      this.volume.controls.size.enable();
      this.volume.controls.mode.enable();
      this.volume.controls.type.setValue("New");
    }
  }

  // ----- Component Functions -----
  constructor(
    private translate: TranslateService,
    private k8s: KubernetesService,
    private ns: NamespaceService) { }

  ngOnInit() {
    this.volume
      .get("name")
      .setValidators([
        Validators.required,
        this.isMountedValidator(),
        Validators.pattern(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/)
      ]);

    this.subscriptions.add(
      this.volume.get("type").valueChanges.subscribe((type: string) => {
        this.setVolumeType(type);
      })
    );

    // name
    this.subscriptions.add(
      this.volume.get("name").valueChanges.subscribe((name: string) => {
        // Update the fields if the volume is an existing one
        this.volume.get("name").setValue(name, { emitEvent: false });
        this.updateVolInputFields();
      })
    );

    // Get the list of mounted volumes of the existing Notebooks in the selected Namespace
    this.subscriptions.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        this.k8s.getResource(ns).subscribe(notebooks => {
          this.mountedVolumes.clear();
          notebooks.map(nb => nb.volumes.map(v => {
            this.mountedVolumes.add(v)
          }));
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ----- @Input change handling functions -----
  notebookNameChanged(nm: string): void {
    if (this.volume.disabled) {
      return;
    }

    this._notebookName = nm;
    this.volume.controls.name.setValue(this.currentVolName);
  }

  storageOptionChanged(ephemeral: boolean): void {
    if (ephemeral) {
      // Disable all fields
      this.volume.controls.type.disable();
      this.volume.controls.name.disable();
      this.volume.controls.size.disable();
      this.volume.controls.mode.disable();
    } else {
      this.volume.controls.type.enable();
      this.volume.controls.name.enable();
      this.updateVolInputFields();
    }
  }

  pvcsChanged(pvcs: Volume[]) {
    this.existingPVCs.clear();
    pvcs.map(pvc => this.existingPVCs.add(pvc.name));

    if (!this.existingPVCs.has(this.currentVolName)) {
      this.updateVolInputFields();
    } else {
      // Also set the selected volume
      this.volume.controls.name.setValue(this.currentVolName);
    }
  }

  showNameError() {
    const volumeName = this.volume.get("name");
    if (volumeName.hasError("required")) {
      return this.translate.instant("volume.errorNameRequired");
    }
    if (volumeName.hasError("pattern")) {
      return this.translate.instant("volume.errorNamePattern");
    }
    if (volumeName.hasError("isMounted")) {
      return this.translate.instant("volume.errorMountedVolume");
    }
  }

  //Method that disables selecting a mounted pvc
  private isMountedValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const exists = this.mountedVolumes.has(control.value);
      return exists ? { isMounted: true } : null;
    };
  }
}
// Error when invalid control is dirty, touched, or submitted
export class PvcErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    //Allows to control when volume is untouched but already assigned
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted || !control.hasError("pattern")));
  }
}
