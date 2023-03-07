import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { Subscription } from 'rxjs';
import { NamespaceService } from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { VolumeResponseObject } from 'src/app/types';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-existing-pvc',
  templateUrl: './pvc.component.html',
  styleUrls: ['./pvc.component.scss'],
})
export class ExistingPvcComponent implements OnInit {
  @Input() pvcGroup: FormGroup;

  pvcs: VolumeResponseObject[] = [];
  private mountedVolumes: Set<string> = new Set<string>(); //AAW
  matcher = new PvcErrorStateMatcher(); //AAW
  subscriptions = new Subscription(); //AAW

  constructor(
    private backend: JWABackendService,
    private ns: NamespaceService,
  ) {}

  ngOnInit(): void {
    this.ns.getSelectedNamespace().subscribe(ns => {
      this.backend.getPVCs(ns).subscribe(pvcs => {
        this.pvcs = pvcs;
      });
    });
    // Get the list of mounted volumes of the existing Notebooks in the selected Namespace, AAW
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
    this.pvcGroup.get("claimName").setValidators([Validators.required, this.isMountedValidator()]); //AAW
  }

  // AAW
  showNameError() {
    const volumeName = this.pvcGroup.get("claimName");

    if (volumeName.hasError("isMounted")) {
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
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    //Allows to control when volume is untouched but already assigned
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

