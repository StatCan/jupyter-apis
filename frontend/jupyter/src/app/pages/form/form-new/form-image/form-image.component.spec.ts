import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormImageComponent } from './form-image.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { FormModule as KfFormModule } from 'kubeflow';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatExpansionModule } from '@angular/material/expansion';

describe('FormImageComponent', () => {
  let component: FormImageComponent;
  let fixture: ComponentFixture<FormImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormImageComponent],
      imports: [
        CommonModule,
        KfFormModule,
        MatIconModule,
        MatButtonToggleModule,
        NoopAnimationsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatIconTestingModule,
        MatExpansionModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormImageComponent);
    component = fixture.componentInstance;
    component.parentForm = new UntypedFormGroup({
      customImage: new UntypedFormControl(),
      customImageCheck: new UntypedFormControl(),
      image: new UntypedFormControl(),
      imageGroupOne: new UntypedFormControl(),
      imageGroupTwo: new UntypedFormControl(),
      imageGroupThree: new UntypedFormControl(),
      serverType: new UntypedFormControl(),
      imagePullPolicy: new UntypedFormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
