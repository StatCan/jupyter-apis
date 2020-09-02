import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, AbstractControl, Validators, ValidatorFn, ControlContainer } from "@angular/forms";

@Component({
  selector: "app-form-specs",
  templateUrl: "./form-specs.component.html",
  styleUrls: ["./form-specs.component.scss", "../resource-form.component.scss"]
})
export class FormSpecsComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonlyCPU: boolean;
  @Input() readonlyMemory: boolean;

  constructor() {}

  ngOnInit() 
  {
    this.parentForm
      .get('cpu')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/), Validators.min(0.5), this.maxCPUValidator()]);
    this.parentForm
      .get('memory')
      .setValidators([Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?(Gi)?$/), Validators.min(1), this.maxMemoryValidator()]);
  }

  showCPUError()
  {
    const cpu = this.parentForm.get('cpu');
    const gpus = this.parentForm.get('gpus').get('num').value;

    if (cpu.hasError('required')) {
      return `Please provide the CPU requirements`;
    }
    if (cpu.hasError('pattern')) {
      return `Invalid character`;
    }
    if (cpu.hasError('min')) {
      return `Can't be less than 0.5 CPU`;
    }
    if (cpu.hasError('maxCPU')) {
      if (gpus=='none') {
        return `Can't exceed 15 CPU`;
      } else {
        return `Can't exceed 5 CPU`;
      }
    }
    
  }

  showMemoryError()
  {
    const memory = this.parentForm.get('memory');
    const gpus = this.parentForm.get('gpus').get('num').value;

    if (memory.hasError('required')) {
      return "Please provide the RAM requirements";
    }
    if (memory.hasError('pattern')) {
      return `Invalid character`
    }
    if (memory.hasError('min')) {
      return `Can't be less than 1Gi of RAM`
    }
    if (memory.hasError('maxMemory')) {
      if (gpus=='none') {
        return `Can't exceed 48Gi of RAM`;
      } else {
        return `Can't exceed 96Gi of RAM`;
      }
    }
  }
  
  private maxCPUValidator(): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any} | null => {
      var max: number;
      const gpus = this.parentForm.get('gpus').get('num').value;
      gpus == 'none' ? max = 15 : max = 5; 
      return control.value>max ? { maxCPU: true } : null
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
}


