import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Volume } from 'src/app/types';
import { updateNonDirtyControl, NamespaceService } from 'kubeflow';
import { ErrorStateMatcher } from '@angular/material/core';
import { JWABackendService } from "src/app/services/backend.service";

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.scss'],
})
export class VolumeComponent implements OnInit, OnDestroy {
  private notebookNamePrv = '';
  private defaultStorageClassPrv: boolean;
  private mountedVolumes: Set<string> = new Set<string>(); // AAW specific

  currentPVC: Volume;
  existingPVCs: Set<string> = new Set();

  subscriptions = new Subscription();

  // Specific error matcher for volume name, AAW
  matcher = new PvcErrorStateMatcher();

  // ----- @Input Parameters -----
  @Input() volume: FormGroup;
  @Input() namespace: string;
  @Input() sizes: Set<string>; //AAW

  @Input()
  get notebookName() {
    return this.notebookNamePrv;
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
    return this.defaultStorageClassPrv;
  }
  set defaultStorageClass(s: boolean) {
    // Update the current pvc type
    this.defaultStorageClassPrv = s;

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
    // Change volume name on notebook-name change, if user hasn't changed it already
    if (!this.volume.controls.name.dirty) {
      return this.volume
        .get('templatedName')
        .value.replace('{notebook-name}', this.notebookName);
    } else {
      return this.volume.get('name').value;
    }
  }

  // ----- utility functions -----
  setVolumeType(type: string) {
    if (type === 'Existing') {
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
      this.volume.controls.type.setValue('Existing');
    } else {
      this.volume.controls.size.enable();
      this.volume.controls.mode.enable();
      this.volume.controls.type.setValue('New');
    }
    // Fix mount point if user hasn't changed it and it's not workspace volume
    updateNonDirtyControl(
      this.volume.get('path'),
      this.volume
        .get('templatedPath')
        .value.replace('{volume-name}', this.currentVolName),
    );
  }

  // ----- Component Functions -----
  constructor(
    private backend: JWABackendService,
    private ns: NamespaceService) {}

  ngOnInit() {
    // AAW specific
    this.volume
      .get("name")
      .setValidators([
        Validators.required,
        this.isMountedValidator(),
        Validators.pattern(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/)
      ]);
    // end AAW specific

    // type
    this.subscriptions.add(
      this.volume.get('type').valueChanges.subscribe((type: string) => {
        this.setVolumeType(type);
      }),
    );

    // name
    this.subscriptions.add(
      this.volume.get('name').valueChanges.subscribe((name: string) => {
        // Update the fields if the volume is an existing one
        this.volume.get('name').setValue(name, { emitEvent: false });
        this.updateVolInputFields();
      }),
    );

    //AAW specific: Get the list of mounted volumes of the existing Notebooks in the selected Namespace
    this.subscriptions.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        this.backend.getNotebooks(ns).subscribe(notebooks => {
          this.mountedVolumes.clear();
          notebooks.map(nb => nb.volumes.map(v => {
            this.mountedVolumes.add(v)
          }));
        });
      })
    );
    // end AAW
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ----- @Input change handling functions -----
  notebookNameChanged(nm: string): void {
    if (this.volume.disabled) {
      return;
    }

    this.notebookNamePrv = nm;
    setTimeout(() => {
      updateNonDirtyControl(this.volume.controls.name, this.currentVolName);
    });
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
  // AAW SPECIFIC CHANGES
  showNameError() {
    const volumeName = this.volume.get("name");

    if (volumeName.hasError("required")) {
      return "required translated";
    }
    if (volumeName.hasError("pattern")) {
      return "pattern haha where is Shallan translate me";
    }
    if (volumeName.hasError("isMounted")) {
      return "already mounted translate me";
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
  // END AAW SPECIFIC CHANGES
}
