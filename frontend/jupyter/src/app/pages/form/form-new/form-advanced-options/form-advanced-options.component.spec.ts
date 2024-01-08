import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormModule as KfFormModule } from 'kubeflow';
import { FormAdvancedOptionsComponent } from './form-advanced-options.component';

describe('FormAdvancedOptionsComponent', () => {
  let component: FormAdvancedOptionsComponent;
  let fixture: ComponentFixture<FormAdvancedOptionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormAdvancedOptionsComponent],
      imports: [
        CommonModule,
        KfFormModule,
        MatSlideToggleModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAdvancedOptionsComponent);
    component = fixture.componentInstance;
    component.parentForm = new UntypedFormGroup({
      shm: new UntypedFormControl(),
      language: new UntypedFormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
