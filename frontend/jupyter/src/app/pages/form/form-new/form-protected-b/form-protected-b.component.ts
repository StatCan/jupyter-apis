import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-form-protected-b',
  templateUrl: './form-protected-b.component.html',
  styleUrls: ['./form-protected-b.component.scss'],
})
export class FormProtectedBComponent implements OnInit {
  @Input() parentForm: FormGroup;

  constructor() {}

  ngOnInit() {
    this.parentForm.get('prob').valueChanges.subscribe(val => {
      (this.parentForm.get('datavols') as FormArray).controls.forEach(
        element => {
          (element as FormGroup)
            .get('existingSource')
            .get('persistentVolumeClaim')
            .get('claimName')
            .updateValueAndValidity();
        },
      );
    });
  }
}
