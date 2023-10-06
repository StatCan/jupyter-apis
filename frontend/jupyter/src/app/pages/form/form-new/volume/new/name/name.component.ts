import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamespaceService } from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { ErrorStateMatcher } from '@angular/material/core';

const NB_NAME_SUBST = '{notebook-name}';

@Component({
  selector: 'app-volume-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.scss'],
})
export class VolumeNameComponent implements OnInit, OnDestroy, OnChanges {
  private templatedName = '';
  private subs = new Subscription();
  private group: FormGroup;
  private externalNamePrv = '';
  private mountedVolumes: Set<string> = new Set<string>();
  matcher = new PvcErrorStateMatcher();

  @Input()
  get metadataGroup(): FormGroup {
    return this.group;
  }
  set metadataGroup(meta: FormGroup) {
    this.group = meta;
    this.subs.unsubscribe();

    // substitute {notebook-name}
    const nameCtrl = this.getNameCtrl(this.metadataGroup);
    setTimeout(() => {
      nameCtrl.setValue(
        this.templatedName.replace(NB_NAME_SUBST, this.externalName),
      );
    });
  }

  @Input()
  get externalName(): string {
    return this.externalNamePrv;
  }
  set externalName(name) {
    this.externalNamePrv = name;
    if (!name) {
      return;
    }

    const nameCtrl = this.getNameCtrl(this.metadataGroup);
    if (nameCtrl.dirty) {
      return;
    }

    // to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      nameCtrl.setValue(this.templatedName.replace(NB_NAME_SUBST, name));
    });
  }

  constructor(
    private backend: JWABackendService,
    private ns: NamespaceService,
  ) {}

  ngOnInit(): void {
    this.templatedName = this.getNameCtrl(this.metadataGroup).value as string;

    this.initComponent();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(): void {
    //this needs to happen because we were losing the validators on init.
    this.initComponent();
  }

  private initComponent(): void {
    // Get the list of mounted volumes of the existing Notebooks in the selected Namespace, AAW
    console.log('def');
    this.subs.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        console.log('ns', ns);
        this.backend.getNotebooks(ns).subscribe(notebooks => {
          console.log('nb', notebooks);
          this.mountedVolumes.clear();
          notebooks.map(nb =>
            nb.volumes.map(v => {
              this.mountedVolumes.add(v);
            }),
          );
          console.log('abc', this.mountedVolumes);
        });
      }),
    );

    this.getNameCtrl(this.metadataGroup).setValidators([
      Validators.required,
      this.isMountedValidator(),
      Validators.pattern(
        /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
      ),
    ]);
  }

  private getNameCtrl(metadata: FormGroup): AbstractControl {
    if (metadata.contains('name')) {
      return metadata.get('name');
    }

    if (metadata.contains('generateName')) {
      return metadata.get('generateName');
    }
  }

  // AAW specific
  showNameError() {
    const volumeName = this.getNameCtrl(this.metadataGroup);

    if (volumeName.hasError('required')) {
      return $localize`Name is required`;
    }
    if (volumeName.hasError('pattern')) {
      return $localize`The volume name can only contain lowercase alphanumeric characters,
       '-' or '.', and must start and end with an alphanumeric character`;
    }
    if (volumeName.hasError('isMounted')) {
      return $localize`Already mounted`;
    }
  }

  //Method that disables selecting a mounted pvc, AAW specific
  private isMountedValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const exists = this.mountedVolumes.has(control.value);
      return exists ? { isMounted: true } : null;
    };
  }
}
// Error when invalid control is dirty, touched, or submitted, AAW Specific
export class PvcErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form && form.submitted;
    //Allows to control when volume is untouched but already assigned
    return !!(
      control &&
      control.invalid &&
      (control.dirty ||
        control.touched ||
        isSubmitted ||
        !control.hasError('pattern'))
    );
  }
}
