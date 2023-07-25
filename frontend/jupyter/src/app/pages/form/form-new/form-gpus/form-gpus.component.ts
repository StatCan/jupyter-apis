import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GPUVendor } from 'src/app/types';
import { JWABackendService } from 'src/app/services/backend.service';
import { V1Namespace } from '@kubernetes/client-node';

@Component({
  selector: 'app-form-gpus',
  templateUrl: './form-gpus.component.html',
  styleUrls: ['./form-gpus.component.scss'],
})
export class FormGpusComponent implements OnInit, OnChanges {
  @Input() parentForm: FormGroup;
  @Input() vendors: GPUVendor[] = [];
  @Input() nsMetadata: V1Namespace;
  @Output() gpuValueEvent = new EventEmitter<string>();

  private gpuCtrl: FormGroup;
  public installedVendors = new Set<string>();

  subscriptions = new Subscription();
  gpusCount = ['1'];

  message: string;

  constructor(public backend: JWABackendService) {}

  ngOnInit() {
    this.handleResource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleResource();
    console.log(changes);
  }

  private handleResource() {
    this.gpuCtrl = this.parentForm.get('gpus') as FormGroup;
    if (this.namespaceHasLabel()) {
      // Disable the GPU number input and set its value to 'none'
      this.gpuCtrl.get('num').setValue('none');
      this.gpuCtrl.get('num').disable();
      this.gpuCtrl.get('vendor').disable();
      this.message = 'GPU not available for learning namespaces';
    } else {
      // Vendor should not be empty if the user selects GPUs num
      this.gpuCtrl.get('num').enable();

      this.parentForm
        .get('gpus')
        .get('vendor')
        .setValidators([this.vendorWithNum()]);

      this.subscriptions.add(
        this.gpuCtrl.get('num').valueChanges.subscribe((n: string) => {
          if (n === 'none') {
            this.message = '';
            this.gpuCtrl.get('vendor').disable();
          } else {
            this.message = $localize`Selecting 1 GPU will automatically set 4 CPUs and 96Gi of memory.`;
            this.gpuCtrl.get('vendor').enable();
          }
          this.gpuValueEvent.emit(n);
        }),
      );

      this.backend.getGPUVendors().subscribe(vendors => {
        this.installedVendors = new Set(vendors);
      });
    }
  }

  // Vendor handling
  public vendorTooltip(vendor: GPUVendor) {
    return !this.installedVendors.has(vendor.limitsKey)
      ? $localize`There are currently no ${vendor.uiName} GPUs in your cluster.`
      : '';
  }

  // Custom Validation
  public getVendorError() {
    const vendorCtrl = this.parentForm.get('gpus').get('vendor');

    if (vendorCtrl.hasError('vendorNullName')) {
      return $localize`You must also specify the GPU Vendor for the assigned GPUs`;
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

  namespaceHasLabel() {
    return (
      this.nsMetadata?.metadata?.labels?.[
        'state.aaw.statcan.gc.ca/learning-namespace'
      ] === 'true'
    );
  }
}
