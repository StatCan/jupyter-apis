import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormModule as KfFormModule } from 'kubeflow';
import { FormAffinityTolerationsComponent } from './form-affinity-tolerations.component';

describe('FormAffinityTolerationsComponent', () => {
  let component: FormAffinityTolerationsComponent;
  let fixture: ComponentFixture<FormAffinityTolerationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormAffinityTolerationsComponent],
      imports: [
        CommonModule,
        KfFormModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAffinityTolerationsComponent);
    component = fixture.componentInstance;
    component.parentForm = new UntypedFormGroup({
      affinityConfig: new UntypedFormControl(),
      tolerationGroup: new UntypedFormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
