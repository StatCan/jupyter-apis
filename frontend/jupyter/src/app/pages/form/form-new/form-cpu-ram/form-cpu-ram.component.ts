import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormGroup,
  AbstractControl,
  Validators,
  ValidatorFn,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
} from '@angular/forms';
import { calculateLimits } from '../utils';
import { ErrorStateMatcher } from '@angular/material/core';

// AAW
type MaxResourceSpec = {
  cpu: number;
  memory: number;
  cpuLimit: number;
  memoryLimit: number;
};
const MAX_FOR_GPU: ReadonlyMap<number, MaxResourceSpec> = new Map([
  [0, { cpu: 14, memory: 48, cpuLimit: 14, memoryLimit: 48 }],
  [1, { cpu: 4, memory: 96, cpuLimit: 4, memoryLimit: 96 }],
]);
// End aaw
@Component({
  selector: 'app-form-cpu-ram',
  templateUrl: './form-cpu-ram.component.html',
  styleUrls: ['./form-cpu-ram.component.scss'],
})
export class FormCpuRamComponent implements OnInit, OnChanges {
  @Input() parentForm: FormGroup;
  @Input() readonlyCPU: boolean;
  @Input() readonlyMemory: boolean;
  @Input() readonlySpecs: boolean;
  @Input() cpuLimitFactor: string;
  @Input() memoryLimitFactor: string;
  @Input() popoverPosition = 'below';

  matcher = new parentErrorKeysErrorStateMatcher(); //AAW

  constructor() {}

  ngOnInit() {
    // AAW VALIDATIONS NOTE: tried removing duplicate code, previously had something for each field
    this.parentForm
      .get('cpu')
      .setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]+)?$/),
        Validators.min(0.5),
        this.maxResourcesValidator('cpu'),
      ]);
    this.parentForm
      .get('memory')
      .setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]+)?$/),
        Validators.min(1),
        this.maxResourcesValidator('memory'),
      ]);
    this.parentForm
      .get('cpuLimit')
      .setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]+)?$/),
        Validators.min(0.5),
        this.maxResourcesValidator('cpuLimit'),
        this.limitValidator('cpu'),
      ]);
    this.parentForm
      .get('memoryLimit')
      .setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]+)?$/),
        Validators.min(1),
        this.maxResourcesValidator('memoryLimit'),
        this.limitValidator('memory'),
      ]);
    // end AAW validations
    
    this.parentForm.get('cpu').valueChanges.subscribe(val => {
      // AAW: to trigger validation
      this.parentForm.get('cpuLimit').updateValueAndValidity();
      /*
      // AAW
      if (this.cpuLimitFactor !== null) {
        this.parentForm
          .get('cpuLimit')
          .setValue(
            (
              parseFloat(this.cpuLimitFactor) * this.parentForm.get('cpu').value
            ).toFixed(1),
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
      */
    });
    
    this.parentForm.get('memory').valueChanges.subscribe(val => {
      // AAw: to trigger validation
      this.parentForm.get('memoryLimit').updateValueAndValidity();
      /*
      //AAW start
      if (this.memoryLimitFactor !== null) {
        this.parentForm
          .get('memoryLimit')
          .setValue(
            (
              parseFloat(this.memoryLimitFactor) *
              this.parentForm.get('memory').value
            ).toFixed(1),
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
      */
    });
   }

  ngOnChanges(changes: SimpleChanges): void {
    //for updating limit inputs
    this.parentForm.get('cpu').updateValueAndValidity();
    this.parentForm.get('memory').updateValueAndValidity();
  }

  // AAW changes
  getCPUError(key: string) {
    let e: any;
    const errs = this.parentForm.get(key).errors || {};

    if (errs.required || errs.pattern) {
      return $localize`Specify number of CPUs`;
    }

    if ((e = errs.min)) {
      return $localize`Specify at least ${e.min} CPUs`;
    }

    if ((e = errs.max)) {
      return $localize`Can't exceed ${e.max} CPUs`;
    }

    if (errs.limit) {
      return $localize`Can't be lower than requested CPUs`;
    }
  }

  getRAMError(key: string) {
    let e: any;
    const errs = this.parentForm.get(key).errors || {};

    if (errs.required || errs.pattern) {
      return $localize`Specify amount of memory (e.g. 2Gi)`;
    }

    if ((e = errs.min)) {
      return $localize`Specify at least ${e.min}Gi of memory`;
    }

    if ((e = errs.max)) {
      return $localize`Can't exceed ${e.max}Gi of memory`;
    }

    if (errs.limit) {
      return $localize`Can't be lower than requested memory`;
    }
  }

  private maxResourcesValidator(input: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const gpuNumValue = this.parentForm.get('gpus').get('num').value;
      const gpu = gpuNumValue === 'none' ? 0 : parseInt(gpuNumValue, 10) || 0;
      const max = MAX_FOR_GPU.get(gpu)[input];

      return control.value > max
        ? { max: { max, actual: control.value } }
        : null;
    };
  }

  private limitValidator(resource: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = this.parentForm.get(resource).value;

      return control.value < value ? { limit: true } : null;
    };
  }
}

// Error when invalid control is dirty, touched, or submitted, AAW
export class parentErrorKeysErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    return !!(
      control &&
      control.invalid &&
      (control.dirty || (form && form.dirty))
    );
  }
}
