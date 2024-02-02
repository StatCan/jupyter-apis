import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-protected-b',
  templateUrl: './form-protected-b.component.html',
  styleUrls: ['./form-protected-b.component.scss'],
})
export class FormProtectedBComponent implements OnInit {
  @Input() parentForm: UntypedFormGroup;

  constructor() {}

  ngOnInit() {
    this.parentForm.get('prob').valueChanges.subscribe(val => {
      (this.parentForm.get('datavols') as UntypedFormArray).controls.forEach(
        element => {
          (element as UntypedFormGroup)
            .get('existingSource')
            .get('persistentVolumeClaim')
            .get('claimName')
            .updateValueAndValidity();
        },
      );
      if (this.parentForm.get('workspace').get('existingSource')) {
        this.parentForm
          .get('workspace')
          .get('existingSource')
          .get('persistentVolumeClaim')
          .get('claimName')
          .updateValueAndValidity();
      }
    });
  }
}
