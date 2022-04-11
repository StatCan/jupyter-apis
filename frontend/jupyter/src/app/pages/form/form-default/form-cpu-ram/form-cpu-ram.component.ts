import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl, Validators, ValidatorFn, ControlContainer, FormControl, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";

const MAX_FOR_GPU: ReadonlyMap<number, MaxResourceSpec> = new Map([
  [0, {cpu: 14, ram: 48, cpulimit: 14, ramlimit: 48}],
  [1, {cpu: 4, ram: 96, cpulimit: 4, ramlimit: 96}]
]);
type MaxResourceSpec = {cpu: number; ram: number, cpulimit: number, ramlimit: number};

function resourcesValidator(): ValidatorFn {
  return function (control: AbstractControl): ValidationErrors | null {
    const gpuNumValue = control.get("gpus").get("num").value;
    const gpu = gpuNumValue === "none" ? 0 : parseInt(gpuNumValue, 10) || 0;
    const cpu = parseFloat(control.get("cpu").value);
    const ram = parseFloat(control.get("memory").value);
    const cpulimit = parseFloat(control.get("cpuLimit").value);
    const ramlimit = parseFloat(control.get("memoryLimit").value);
    const errors = {};
    const max = MAX_FOR_GPU.get(gpu);
    if (gpu == 0) {
      if (cpu > max.cpu) {
        errors["maxCpu"] = {max: max.cpu, gpu};
      }
      if (ram > max.ram) {
        errors["maxRam"] = {max: max.ram, gpu};
      }
      if (cpulimit > max.cpulimit){
        errors["cpuLimit"] = {max: max.cpulimit, gpu}
      }
      if (ramlimit > max.ramlimit){
        errors["ramLimit"] = {max: max.ramlimit, gpu}
      }
    }
    return Object.entries(errors).length > 0 ? errors : null;
  };
}
@Component({
  selector: 'app-form-cpu-ram',
  templateUrl: './form-cpu-ram.component.html',
  styleUrls: ['./form-cpu-ram.component.scss'],
})
export class FormCpuRamComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonlyCPU: boolean;
  @Input() readonlyMemory: boolean;
  @Input() cpuLimitFactor: string;
  @Input() memoryLimitFactor: string;
  @Input() readonlySpecs: boolean;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.parentForm
      .get('cpu')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(0.5), this.maxCPUValidator()]);
    this.parentForm
      .get('memory')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(1), this.maxMemoryValidator()]);
    this.parentForm
      .get('cpuLimit')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(0.5), this.maxCPULimitValidator()])
    this.parentForm
      .get('memoryLimit')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(1), this.maxMemoryLimitValidator()])
      this.parentForm.setValidators(resourcesValidator());

      this.parentForm.get('cpu').valueChanges.subscribe(val => {
        //set cpu limit when value of the cpu request changes
        if (this.cpuLimitFactor !== null) {
          this.parentForm
            .get('cpuLimit')
            .setValue(
              (
                parseFloat(this.cpuLimitFactor) * this.parentForm.get('cpu').value
              ).toFixed(1),
            );
        }
      });
      this.parentForm.get('memory').valueChanges.subscribe(val => {
        //set memory limit when value of the memory request changes
        if (this.memoryLimitFactor !== null) {
          this.parentForm
            .get('memoryLimit')
            .setValue(
              (
                parseFloat(this.memoryLimitFactor) *
                this.parentForm.get('memory').value
              ).toFixed(1),
            );

        }
      });
  }
  private maxCPULimitValidator(): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any} | null => {
      var max: number;
      const gpus = this.parentForm.get('gpus').get('num').value;
      gpus == 'none' ? max = 15 : max = 4;
      return control.value>max ? { maxCPU: true } : null
    }
  }

  private maxMemoryLimitValidator(): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any} | null => {
      var max: number;
      const gpus = this.parentForm.get('gpus').get('num').value;
      gpus == 'none' ? max = 48 : max = 96;
      return control.value>max ? { maxMemory: true } : null

    }  }

  private maxCPUValidator(): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any} | null => {
      var max: number;
      const gpus = this.parentForm.get('gpus').get('num').value;
      gpus == 'none' ? max = 15 : max = 4;
      return control.value>max ? { maxCPULimit: true } : null
    }
  }

  private maxMemoryValidator(): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any} | null => {
      var max: number;
      const gpus = this.parentForm.get('gpus').get('num').value;
      gpus == 'none' ? max = 48 : max = 96;
      return control.value>max ? { maxMemory: true } : null
    }
  }

  parentErrorKeysErrorStateMatcher(keys: string | string[]) {
    const arrKeys = ([] as string[]).concat(keys);
    return {
      isErrorState(
        control: FormControl,
        form: FormGroupDirective | NgForm
      ): boolean {
        return (
          (control.dirty && control.invalid) ||
          (form.dirty && arrKeys.some(key => form.hasError(key)))
        );
      }
    };
  }

  cpuErrorMessage() {
    let e: any;
    const errs = this.parentForm.get("cpu").errors || {};
    if (errs.required || errs.pattern )
      return this.translate.instant("jupyter.formSpecs.errorCpuRequired");
    if ((e = errs.min))
      return this.translate.instant("jupyter.formSpecs.errorCpuMin", {min: `${e.min}`});
    if (this.parentForm.hasError("maxCpu")) {
      e = this.parentForm.errors.maxCpu;
      return this.translate.instant("jupyter.formSpecs.errorCpuMax", {max: `${e.max}`});
    }
  }

  getRAMError() {
    let e: any;
    const errs = this.parentForm.get("memory").errors || {};
    if (errs.required || errs.pattern)
    return this.translate.instant("jupyter.formSpecs.errorRamRequired");
    if (e = errs.min){
      return this.translate.instant("jupyter.formSpecs.errorRamMin", {min: `${e.min}`});
    }
    if (this.parentForm.hasError("maxRam")) {
      e = this.parentForm.errors.maxRam;
      return this.translate.instant("jupyter.formSpecs.errorRamMax", {max: `${e.max}`});
    }
  }

  getCPULimitError() {
    let e: any;
    const errs = this.parentForm.get("cpuLimit").errors || {};
    if (errs.required || errs.pattern )
      return this.translate.instant("jupyter.formSpecs.errorCpuRequired");
    if (e = errs.min){
      return this.translate.instant("jupyter.formSpecs.errorCpuMin", {min: `${e.min}`});
    }
    if (this.parentForm.hasError("cpuLimit")) {
      e = this.parentForm.errors.cpuLimit;
      return this.translate.instant("jupyter.formSpecs.errorCpuMax", {max: `${e.max}`});
    }
  }

  getMemoryLimitError() {
    let e: any;
    const errs = this.parentForm.get("memoryLimit").errors || {};
    if (errs.required || errs.pattern)
    return this.translate.instant("jupyter.formSpecs.errorRamRequired");;
    if ((e = errs.min))
      return this.translate.instant("jupyter.formSpecs.errorRamMin", {min: `${e.min}`});
    if (this.parentForm.hasError("ramLimit")) {
      e = this.parentForm.errors.ramLimit;
      return this.translate.instant("jupyter.formSpecs.errorRamMax", {max: `${e.max}`});
    }
  }

}
