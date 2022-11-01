import { Component, Input, AfterViewChecked, OnInit, ChangeDetectorRef, LOCALE_ID, Inject} from "@angular/core";
import {FormBuilder, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'app-form-advanced-options',
  templateUrl: './form-advanced-options.component.html',
  styleUrls: ['./form-advanced-options.component.scss'],
})
export class FormAdvancedOptionsComponent implements AfterViewChecked, OnInit{
  @Input() parentForm: FormGroup;
  languageList = [
    {'id':'en', 'label':'English'},
    {'id':'fr', 'label':'Français'}
  ];
  constructor(@Inject(LOCALE_ID) public localeId: string, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.parentForm = this.fb.group({
      language: new FormControl(),
      shm: new FormControl()
    });
  }

  ngOnInit(){
    this.parentForm.get('language').setValue(this.localeId)
  }

  ngAfterViewChecked(){
    this.cdr.detectChanges();
  }
}