import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-name',
  templateUrl: './form-name.component.html',
  styleUrls: ['./form-name.component.scss'],
})
export class FormNameComponent {
  subscriptions = new Subscription();

  @Input() parentForm: UntypedFormGroup;
  @Input() existingNotebooks: Set<string>;

  constructor() {}
}
