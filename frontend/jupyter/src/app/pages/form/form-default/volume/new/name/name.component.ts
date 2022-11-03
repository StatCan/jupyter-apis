import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorStateMatcher } from '@angular/material/core';

const NB_NAME_SUBST = '{notebook-name}';

@Component({
  selector: 'app-volume-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.scss'],
})
export class VolumeNameComponent implements OnInit, OnDestroy {
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

  constructor() {}

  ngOnInit(): void {
    this.templatedName = this.getNameCtrl(this.metadataGroup).value as string;
    //error messages not showing up
    this.getNameCtrl(this.metadataGroup).setValidators([
        Validators.required,
        this.isMountedValidator(),
        Validators.pattern(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/)
      ]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
    const volumeName = this.getNameCtrl(this.metadataGroup); // should this be like the getNameCtrl?

    if (volumeName.hasError("required")) {
      return $localize`Name is required`;
    }
    if (volumeName.hasError("pattern")) {
      return $localize`The volume name can only contain lowercase alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character`;
    }
    if (volumeName.hasError("isMounted")) {
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
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    //Allows to control when volume is untouched but already assigned
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted || !control.hasError("pattern")));
  }
}
