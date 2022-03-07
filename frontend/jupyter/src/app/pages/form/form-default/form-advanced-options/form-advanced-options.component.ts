import { Component, Input, AfterViewChecked, OnInit, ChangeDetectorRef} from "@angular/core";
import {FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
@Component({
  selector: "app-form-advanced-options",
  templateUrl: "./form-advanced-options.component.html",
  styleUrls: [
    "./form-advanced-options.component.scss"
  ]
})
export class FormAdvancedOptionsComponent implements AfterViewChecked, OnInit{
  @Input() parentForm: FormGroup;
  languageList = [
    {'id':'en', 'label':'jupyter.formAdvancedOptions.lblEnglish'},
    {'id':'fr', 'label':'jupyter.formAdvancedOptions.lblFrench'}
  ];
  constructor(private translate: TranslateService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.parentForm = this.fb.group({
      language: new FormControl(),
      shm: new FormControl()
    });
  }

  ngOnInit(){
    this.parentForm.get('language').setValue(this.translate.defaultLang)

  }

  ngAfterViewChecked(){
    this.cdr.detectChanges();
  }
}