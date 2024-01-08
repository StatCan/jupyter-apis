import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormModule as KfFormModule, SnackBarService } from 'kubeflow';
import { FormCpuRamComponent } from './form-cpu-ram.component';

const SnackBarServiceStub: Partial<SnackBarService> = {
  open: () => {},
  close: () => {},
};

describe('FormCpuRamComponent', () => {
  let component: FormCpuRamComponent;
  let fixture: ComponentFixture<FormCpuRamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormCpuRamComponent],
      imports: [
        CommonModule,
        KfFormModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [{ provide: SnackBarService, useValue: SnackBarServiceStub }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCpuRamComponent);
    component = fixture.componentInstance;
    component.parentForm = new UntypedFormGroup({
      cpu: new UntypedFormControl(),
      cpuLimit: new UntypedFormControl(),
      memory: new UntypedFormControl(),
      memoryLimit: new UntypedFormControl(),
      gpus: new UntypedFormGroup({
        vendor: new UntypedFormControl(),
        num: new UntypedFormControl(),
      }),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
