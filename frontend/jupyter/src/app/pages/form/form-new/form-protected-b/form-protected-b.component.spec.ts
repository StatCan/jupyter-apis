import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormProtectedBComponent } from './form-protected-b.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormModule as KfFormModule } from 'kubeflow';
import {
  UntypedFormControl,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

describe('FormProtectedBComponent', () => {
  let component: FormProtectedBComponent;
  let fixture: ComponentFixture<FormProtectedBComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormProtectedBComponent],
      imports: [
        MatIconModule,
        CommonModule,
        KfFormModule,
        MatCheckboxModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormProtectedBComponent);
    component = fixture.componentInstance;
    component.parentForm = new UntypedFormGroup({
      prob: new UntypedFormControl(),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
