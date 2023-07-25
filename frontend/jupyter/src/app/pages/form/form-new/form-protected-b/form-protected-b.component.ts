import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
} from '@angular/forms';

import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-form-protected-b',
  templateUrl: './form-protected-b.component.html',
  styleUrls: ['./form-protected-b.component.scss'],
})
export class FormProtectedBComponent implements OnInit {
  @Input() parentForm: FormGroup;

  constructor() {}

  ngOnInit() {  }
}
