import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl, Validators, ValidatorFn, ControlContainer, FormControl, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import { calculateLimits } from '../utils';

@Component({
  selector: 'app-form-cpu-ram',
  templateUrl: './form-cpu-ram.component.html',
  styleUrls: ['./form-cpu-ram.component.scss'],
})
export class FormCpuRamComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonlyCPU: boolean;
  @Input() readonlyMemory: boolean;
  @Input() readonlySpecs: boolean;
  @Input() cpuLimitFactor: string;
  @Input() memoryLimitFactor: string;

  constructor() {}

  ngOnInit() {
    // AAW VALIDATIONS NOTE: tried removing duplicate code, previously had something for each field
    var maxCpu: number;
    var maxMemory: number;
    const gpus = this.parentForm.get('gpus').get('num').value;
    if(gpus == 'none'){
      maxCpu = 14;
      maxMemory = 48;
    }else{
      maxCpu = 4;
      maxMemory = 96;
    }
    
    this.parentForm
      .get('cpu')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(0.5), Validators.max(maxCpu)]);
    this.parentForm
      .get('memory')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(1), Validators.max(maxMemory)]);
    this.parentForm
      .get('cpuLimit')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(0.5), Validators.max(maxCpu)])
    this.parentForm
      .get('memoryLimit')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(1), Validators.max(maxMemory)])
    // end AAW validations

    this.parentForm.get('cpu').valueChanges.subscribe(val => {
      // AAW 
      if (this.cpuLimitFactor !== null) {
        this.parentForm
          .get('cpuLimit')
          .setValue(
            (
              parseFloat(this.cpuLimitFactor) * this.parentForm.get('cpu').value
            ).toFixed(1)
          );
      } // AAW end

      // set cpu limit when value of the cpu request changes
      if (this.parentForm.get('cpuLimit').dirty) {
        return;
      }

      const cpu = this.parentForm.get('cpu').value;
      this.parentForm
        .get('cpuLimit')
        .setValue(calculateLimits(cpu, this.cpuLimitFactor));
    });

    this.parentForm.get('memory').valueChanges.subscribe(val => {
      //AAW start
      if (this.memoryLimitFactor !== null) {
        this.parentForm
          .get('memoryLimit')
          .setValue(
            (
              parseFloat(this.memoryLimitFactor) *
              this.parentForm.get('memory').value
            ).toFixed(1)
          );

      } //  AAW end
      // set memory limit when value of the memory request changes
      if (this.parentForm.get('memoryLimit').dirty) {
        return;
      }

      const memory = this.parentForm.get('memory').value;
      this.parentForm
        .get('memoryLimit')
        .setValue(calculateLimits(memory, this.memoryLimitFactor));
    });
  }

  // AAW changes
  getRAMLimitError(key: string) {
    let e: any;
    const errs = this.parentForm.get(key).errors || {};

    if (errs.required || errs.pattern)
      return $localize`Specify amount of memory (e.g. 2Gi) `;

    if (e = errs.min){
      return $localize`Specify at least ${e.min}Gi of memory`;
    }

    if (e = errs.max) {
      return $localize`Can't exceed ${e.max}Gi of memory`;
    }
  }

  getCPULimitError(key: string) {
    let e: any;
    const errs = this.parentForm.get(key).errors || {};

    if (errs.required || errs.pattern )
      return $localize`Specify number of CPUs`;

    if (e = errs.min){
      return $localize`Specify at least ${e.min} CPUs`;
    }

    if (e = errs.max) {
      return $localize`Can't exceed ${e.max} CPUs`;
    }
  }

  parentErrorKeysErrorStateMatcher() {
    return {
      isErrorState(
        control: FormControl,
        form: FormGroupDirective | NgForm
      ): boolean {
        return (
          control && control.invalid && (control.dirty || form.dirty)
        );
      }
    };
  }
}
