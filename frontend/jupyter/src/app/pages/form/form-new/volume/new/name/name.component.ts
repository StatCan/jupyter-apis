import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ValidatorFn,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

const NB_NAME_SUBST = '{notebook-name}';

@Component({
  selector: 'app-volume-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.scss'],
})
export class VolumeNameComponent implements OnInit, OnChanges {
  private templatedName = '';
  private group: UntypedFormGroup;
  private externalNamePrv = '';
  matcher = new PvcErrorStateMatcher();

  @Input() mountedVolumes: Set<string>;
  @Input()
  get metadataGroup(): UntypedFormGroup {
    return this.group;
  }
  set metadataGroup(meta: UntypedFormGroup) {
    this.group = meta;

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

  constructor() {}

  ngOnInit(): void {
    this.templatedName = this.getNameCtrl(this.metadataGroup).value as string;

    this.initComponent();
  }

  ngOnChanges(): void {
    //this needs to happen because we were losing the validators on init.
    this.initComponent();
  }

  private initComponent(): void {
    this.getNameCtrl(this.metadataGroup).setValidators([
      Validators.required,
      this.isMountedValidator(),
      Validators.pattern(
        /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
      ),
    ]);
  }

  private getNameCtrl(metadata: UntypedFormGroup): AbstractControl {
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
    control: UntypedFormControl | null,
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
