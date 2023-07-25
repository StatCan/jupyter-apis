import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormImageCustomComponent } from './form-image-custom.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormModule as KfFormModule } from 'kubeflow';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatExpansionModule } from '@angular/material/expansion';

describe('FormImageCustomComponent', () => {
  let component: FormImageCustomComponent;
  let fixture: ComponentFixture<FormImageCustomComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormImageCustomComponent],
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
    fixture = TestBed.createComponent(FormImageCustomComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormGroup({
      customImage: new FormControl(),
      customImageCheck: new FormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
