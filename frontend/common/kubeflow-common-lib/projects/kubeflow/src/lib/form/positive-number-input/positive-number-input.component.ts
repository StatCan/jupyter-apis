import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'lib-positive-number-input',
  templateUrl: './positive-number-input.component.html',
  styleUrls: ['./positive-number-input.component.scss'],
})
export class PositiveNumberInputComponent implements OnInit {
  @Input() sizeControl: FormControl<number|string>;

  @Input() label: string;

  @Input() min = 0.1;

  @Input() step = 0.1;

  constructor() {}

  ngOnInit() {
    this.sizeControl.setValidators([Validators.required, Validators.min(0)]);
  }
}
