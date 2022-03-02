import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GPUVendor } from 'src/app/types';
import { JWABackendService } from 'src/app/services/backend.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-form-gpus',
  templateUrl: './form-gpus.component.html',
  styleUrls: ['./form-gpus.component.scss'],
})
export class FormGpusComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() vendors: GPUVendor[] = [];
  @Output() gpuValueEvent = new EventEmitter<string>();

  private gpuCtrl: FormGroup;
  public installedVendors = new Set<string>();
  public selected = 'none';
  subscriptions = new Subscription();
  maxGPUs = 16;
  gpusCount = ['1'];
  message: string;

  constructor(
    public backend: JWABackendService,
    private translate: TranslateService,
  ) {}

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
          this.message = "Selecting 1 GPU will automatically set 4 CPUs and 96Gi of memory."
          this.gpuCtrl.get('vendor').enable();
        }
        this.gpuValueEvent.emit(n)
      }),
    );

    this.backend.getGPUVendors().subscribe(vendors => {
      this.installedVendors = new Set(vendors);
    });
  }

  // Vendor handling
  public vendorIsDisabled(vendor: GPUVendor) {
    return !this.installedVendors.has(vendor.limitsKey);
  }

  public vendorTooltip(vendor: GPUVendor) {
    return !this.installedVendors.has(vendor.limitsKey)
      ? this.translate.instant('jupyter.formGpus.errorGpuVendorNotFound', {
        vendoruiName: `${vendor.uiName}`,
      })
      : '';
  }

  // Custom Validation
  public getVendorError() {
    const vendorCtrl = this.parentForm.get('gpus').get('vendor');

    if (vendorCtrl.hasError('vendorNullName')) {
      return this.translate.instant('jupyter.formGpus.errorGpuVendorRequired');
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
