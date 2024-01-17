import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  UntypedFormControl,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormModule, RokService, SnackBarService } from 'kubeflow';

import { RokUrlComponent } from './rok-url.component';

const SnackBarServiceStub: Partial<SnackBarService> = {
  open: () => {},
  close: () => {},
};

describe('RokUrlComponent', () => {
  let component: RokUrlComponent;
  let fixture: ComponentFixture<RokUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RokUrlComponent],
      imports: [
        CommonModule,
        FormModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: SnackBarService, useValue: SnackBarServiceStub },
        { provide: RokService, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RokUrlComponent);
    component = fixture.componentInstance;
    component.volGroup = new UntypedFormGroup({
      mount: new UntypedFormControl(),
      newPvc: new UntypedFormGroup({
        metadata: new UntypedFormGroup({
          annotations: new UntypedFormGroup({
            ['rok/origin']: new UntypedFormControl(),
          }),
        }),
        spec: new UntypedFormGroup({
          resources: new UntypedFormGroup({
            requests: new UntypedFormGroup({
              storage: new UntypedFormControl(),
            }),
          }),
        }),
      }),
      existingSource: new UntypedFormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
