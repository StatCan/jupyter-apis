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
        this.unclassifiedPvcs.clear();
        pvcs.forEach(pvc => this.unclassifiedPvcs.add(pvc.name));
      });
    });

    this.pvcGroup
      .get('claimName')
      .setValidators([Validators.required, this.isMountedValidator()]); //AAW
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
  }

  //Method that disables selecting a mounted pvc, AAW
  private isMountedValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const exists = this.mountedVolumes.has(control.value);
      return exists ? { isMounted: true } : null;
    };
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
