import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GPUVendor } from 'src/app/utils/types';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-form-gpus',
  templateUrl: './form-gpus.component.html',
  styleUrls: ['./form-gpus.component.scss', '../resource-form.component.scss'],
})
export class FormGpusComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() vendors: GPUVendor[];
  @Output() gpuValueEvent = new EventEmitter<string>();
  
  private gpuCtrl: FormGroup;
  subscriptions = new Subscription();

  maxGPUs = 16;
  gpusCount = ['1'];

  message: string;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.gpuCtrl = this.parentForm.get('gpus') as FormGroup;

    // Vendor should not be empty if the user selects GPUs num
    this.parentForm
      .get('gpus')
      .get('vendor')
      .setValidators([this.vendorWithNum()]);

    this.subscriptions.add(
      this.gpuCtrl.get('num').valueChanges.subscribe((n: string) => {
        if (n === 'none') {
          this.message = "";
          this.gpuCtrl.get('vendor').disable();
        } else {
          this.message = this.translate.instant('formGpus.specsWarningMessage')
          this.gpuCtrl.get('vendor').enable();
        }
        this.gpuValueEvent.emit(n)
      }),
    );
  }

  // Custom Validation
  public getVendorError() {
    const vendorCtrl = this.parentForm.get('gpus').get('vendor');

    if (vendorCtrl.hasError('vendorNullName')) {
      return this.translate.instant('formGpus.errorGpuVendorRequired');
    }
  }

  private vendorWithNum(): ValidatorFn {
    // Make sure that if the user has specified a number of GPUs
    // that they also specify the GPU vendor
    return (control: AbstractControl): { [key: string]: any } => {
      const num = this.parentForm.get('gpus').get('num').value;
      const vendor = this.parentForm.get('gpus').get('vendor').value;

      if (num !== 'none' && vendor === '') {
        return { vendorNullName: true };
      } else {
        return null;
      }
    };
  }
}
