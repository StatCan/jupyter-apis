import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormDialogConfig, FormDialogResponse } from '../types';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { DIALOG_RESP } from '../../confirm-dialog/types';

@Component({
  selector: 'lib-form-dialog',
  templateUrl: 'form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
})
export class FormDialogComponent implements OnInit {
  public formDialogFormGroup!: FormGroup;
  public DIALOG_RESP = DIALOG_RESP;
  public isApplying = false;
  public applying$ = new Subject<FormDialogResponse>();

  public sizes: number[] = [4, 8, 16, 32, 64, 128, 256, 512];
  public oldSizeNum = 0;
  public disabledSizes: string[] = [];
  public enabledSizes: string[] = [];

  constructor(
    public formDialogRef: MatDialogRef<FormDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: FormDialogConfig,
  ) {}

  ngOnInit() {
    this.applying$.subscribe(res => {
      this.isApplying = res.applying;
    });

    this.oldSizeNum = parseInt(this.data.oldSize, 10);

    const fb = new FormBuilder();
    this.formDialogFormGroup = fb.group({
      sizeNum: [
        this.oldSizeNum,
        [
          Validators.required,
          this.isSmallerSizeValidator(), // Error will mainly appear if user opens the dropdown but doesn't select an option
        ],
      ],
    });
  }

  isBiggerSize(newSize: number) {
    return newSize > this.oldSizeNum;
  }

  onAcceptClicked(): void {
    // clear the error message
    this.data.error = '';

    const newSize: number = this.formDialogFormGroup.get('sizeNum')?.value;

    this.isApplying = true;
    this.applying$.next({
      applying: true,
      newSize: newSize,
    });
  }

  private isSmallerSizeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      return !this.isBiggerSize(control.value) ? { isSmallerSize: true } : {};
    };
  }

  getErrorMessage(key: string) {
    let e: any;
    const errs = this.formDialogFormGroup.get(key)?.errors || {};

    if ((e = errs.required)) {
      return $localize`Size is required`;
    }
    if ((e = errs.isSmallerSize)) {
      return $localize`New size has to be larger than the current value`;
    }
  }
}
