import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  UntypedFormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { NamespaceService } from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { PVCResponseObject } from 'src/app/types';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-existing-pvc',
  templateUrl: './pvc.component.html',
  styleUrls: ['./pvc.component.scss'],
})
export class ExistingPvcComponent implements OnInit {
  @Input() pvcGroup: UntypedFormGroup;
  @Input() mountedVolumes: Set<string>;

  pvcs: PVCResponseObject[] = [];
  protectedBPvcs: Set<string> = new Set<string>();
  unclassifiedPvcs: Set<string> = new Set<string>();

  matcher = new PvcErrorStateMatcher(); //AAW

  constructor(
    private backend: JWABackendService,
    private ns: NamespaceService,
  ) {}

  ngOnInit(): void {
    this.ns.getSelectedNamespace().subscribe(ns => {
      this.backend.getPVCs(ns).subscribe(pvcs => {
        this.pvcs = pvcs;
        this.protectedBPvcs.clear();
        this.unclassifiedPvcs.clear();
        pvcs.forEach(pvc =>
          pvc.labels?.['data.statcan.gc.ca/classification'] === 'protected-b'
            ? this.protectedBPvcs.add(pvc.name)
            : this.unclassifiedPvcs.add(pvc.name),
        );
      });
    });

    this.pvcGroup
      .get('claimName')
      .setValidators([
        Validators.required,
        this.isMountedValidator(),
        this.isProtectedBValidator(),
      ]); //AAW
  }

  // AAW
  showNameError() {
    const volumeName = this.pvcGroup.get('claimName');

    if (volumeName.hasError('required')) {
      return $localize`Name is required`;
    }
    if (volumeName.hasError('isMounted')) {
      return $localize`Is mounted`;
    }
    if (volumeName.hasError('isNotProb')) {
      return $localize`Notebook is protected B but volume is unclassified`;
    }
    if (volumeName.hasError('isNotUnclassified')) {
      return $localize`Notebook is unclassified but volume is protected B`;
    }
  }

  //Method that disables selecting a mounted pvc, AAW
  private isMountedValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const exists = this.mountedVolumes.has(control.value);
      return exists ? { isMounted: true } : null;
    };
  }

  //Method that disables selecting a mounted pvc, AAW
  private isProtectedBValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      // if its a workspace volume or a data volume
      const protB = control.parent.parent.parent.parent.get('prob')
        ? control.parent.parent.parent.parent.get('prob').value
        : control.parent.parent.parent.parent.parent.get('prob').value;

      // Check for each volume if it's ok.
      if (protB && !this.protectedBPvcs.has(control.value)) {
        return { isNotProb: true };
      } else if (!protB && !this.unclassifiedPvcs.has(control.value)) {
        return { isNotUnclassified: true };
      }
      return null;
    };
  }

  public isProtectedLabel(pvc): string {
    let status = '';
    if (pvc.labels?.['data.statcan.gc.ca/classification'] === 'protected-b') {
      status = '(protected-b)';
    }
    return status;
  }
}

// Error when invalid control is dirty, touched, or submitted, AAW
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
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
