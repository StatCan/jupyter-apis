import { Component, OnInit, Input, LOCALE_ID, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-advanced-options',
  templateUrl: './form-advanced-options.component.html',
  styleUrls: ['./form-advanced-options.component.scss'],
})
export class FormAdvancedOptionsComponent implements OnInit {
  @Input() parentForm: UntypedFormGroup;
  languageList = [
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Français' },
  ];

  constructor(@Inject(LOCALE_ID) public localeId: string) {}

  ngOnInit() {
    this.parentForm.get('language').setValue(this.localeId);
  }
}
