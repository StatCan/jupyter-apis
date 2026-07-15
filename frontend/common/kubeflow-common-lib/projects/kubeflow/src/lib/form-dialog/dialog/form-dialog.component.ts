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
  public formDialogFormGroup: FormGroup;
  public DIALOG_RESP = DIALOG_RESP;
  public isApplying = false;
  public applying$ = new Subject<FormDialogResponse>();

  private sizes = ['4Gi', '8Gi', '16Gi', '32Gi', '64Gi', '128Gi', '256Gi', '512Gi']
  public disabledSizes: string[] = []
  public enabledSizes: string[] = []

  constructor(
    public formDialogRef: MatDialogRef<FormDialogComponent>,
    
    @Inject(MAT_DIALOG_DATA) public data: FormDialogConfig,
  ) {}

  ngOnInit() {
    this.applying$.subscribe(res => {
      this.isApplying = res.applying;
    });
    const fb = new FormBuilder();

    this.formDialogFormGroup = fb.group({
      sizeNum: [
        this.data.oldSize,
        [
          Validators.required,
          this.isDisabledSizeValidator(),
        ],
      ],
    });

    let largerSize = false;
    for(let i = 0; i < this.sizes.length; i++){
      if(!largerSize){
        this.disabledSizes.push(this.sizes[i]);

        if(this.sizes[i] == this.data.oldSize){
          largerSize = true;
        }
      }else{
        this.enabledSizes.push(this.sizes[i]);
      }
    }
  }

  onAcceptClicked(): void {
    const newSize = this.formDialogFormGroup.get('sizeNum')?.value.toString();
    
    this.isApplying = true;
    this.applying$.next({
      applying: true,
      newSize: newSize,
    });
  }

  onCancelClicked(): void {
    this.formDialogRef.close(DIALOG_RESP.CANCEL);
  }

  isDisabledSize(): boolean {
    const inputSize = this.formDialogFormGroup.get('sizeNum')?.value.toString();

    return this.disabledSizes.includes(inputSize)
  }

  private isDisabledSizeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      return this.disabledSizes.includes(control.value) ? { isDisabledSize: true } : null;
    };
  }
}
