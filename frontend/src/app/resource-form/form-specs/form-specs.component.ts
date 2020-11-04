import {Component, OnInit, Input} from "@angular/core";
import {
  FormGroup,
  AbstractControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  FormControl,
  FormGroupDirective,
  NgForm
} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";

const MAX_FOR_GPU: ReadonlyMap<number, MaxResourceSpec> = new Map([
  [0, {cpu: 15, ram: 48}],
  [1, {cpu: 5, ram: 96}]
]);

type MaxResourceSpec = {cpu: number; ram: number};

function resourcesValidator(): ValidatorFn {
  return function (control: AbstractControl): ValidationErrors | null {
    const gpuNumValue = control.get("gpus").get("num").value;
    const gpu = gpuNumValue === "none" ? 0 : parseInt(gpuNumValue, 10) || 0;
    const cpu = parseFloat(control.get("cpu").value);
    const ram = parseFloat(control.get("memory").value);
    const errors = {};

    const max = MAX_FOR_GPU.get(gpu);
    if (cpu > max.cpu) {
      errors["maxCpu"] = {max: max.cpu, gpu};
    }
    if (ram > max.ram) {
      errors["maxRam"] = {max: max.ram, gpu};
    }

    return Object.entries(errors).length > 0 ? errors : null;
  };
}

@Component({
  selector: "app-form-specs",
  templateUrl: "./form-specs.component.html",
  styleUrls: ["./form-specs.component.scss", "../resource-form.component.scss"]
})
export class FormSpecsComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonlyCPU: boolean;
  @Input() readonlyMemory: boolean;

  constructor(private translate: TranslateService) {}
  ngOnInit() {
    this.parentForm
      .get("cpu")
      .setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]+)?$/),
        Validators.min(0.5)
      ]);
    this.parentForm
      .get("memory")
      .setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]+)?(Gi)$/),
        Validators.min(1)
      ]);
    this.parentForm.setValidators(resourcesValidator());
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

  cpuErrorMessage(): string {
    let e: any;
    const errs = this.parentForm.get("cpu").errors || {};

    if (errs.required)
      return this.translate.instant("formSpecs.errorCpuRequired");
    if (errs.pattern) return this.translate.instant("formSpecs.errorCpuNumber");
    if ((e = errs.min))
      return this.translate.instant("formSpecs.errorCpuMin", {min: `${e.min}`});
    if (this.parentForm.hasError("maxCpu")) {
      e = this.parentForm.errors.maxCpu;
      return (
        this.translate.instant("formSpecs.errorCpuMax", {max: `${e.max}`}) +
        (e.gpu > 0
          ? this.translate.instant("formSpecs.errorCpuMaxLimit", {
              gpu: `${e.gpu}`
            })
          : "")
      );
    }
  }

  memoryErrorMessage(): string {
    let e: any;
    const errs = this.parentForm.get("memory").errors || {};

    if (errs.required || errs.pattern)
      return this.translate.instant("formSpecs.errorRamRequired");
    if ((e = errs.min))
      return this.translate.instant("formSpecs.errorRamMin", {min: `${e.min}`});

    if (this.parentForm.hasError("maxRam")) {
      e = this.parentForm.errors.maxRam;
      return (
        this.translate.instant("formSpecs.errorRamMax", {max: `${e.max}`}) +
        (e.gpu > 0
          ? this.translate.instant("formSpecs.errorRamMaxLimit", {
              gpu: `${e.gpu}`
            })
          : "")
      );
    }
  }
}
