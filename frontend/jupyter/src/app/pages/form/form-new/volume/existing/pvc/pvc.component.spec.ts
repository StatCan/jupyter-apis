import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NamespaceService } from 'kubeflow';
import { of } from 'rxjs';
import { JWABackendService } from 'src/app/services/backend.service';
import { ExistingPvcComponent } from './pvc.component';

const JWABackendServiceStub: Partial<JWABackendService> = {
  getPVCs: () => of(),
};

const NamespaceServiceStub: Partial<NamespaceService> = {
  getSelectedNamespace: () => of(),
};

describe('ExistingPvcComponent', () => {
  let component: ExistingPvcComponent;
  let fixture: ComponentFixture<ExistingPvcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExistingPvcComponent],
      imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: JWABackendService, useValue: JWABackendServiceStub },
        { provide: NamespaceService, useValue: NamespaceServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingPvcComponent);
    component = fixture.componentInstance;
    const fakeData = new UntypedFormGroup({
      prob: new UntypedFormControl(),
      datavols: new UntypedFormArray([
        new UntypedFormGroup({
          existingSource: new UntypedFormGroup({
            persistantVolumeClaim: new UntypedFormGroup({
              readOnly: new UntypedFormControl(),
              claimName: new UntypedFormControl(),
            }),
          }),
        }),
      ]),
    });

    component.pvcGroup = (fakeData.get('datavols') as UntypedFormArray)
      .at(0)
      .get('existingSource')
      .get('persistantVolumeClaim') as UntypedFormGroup;
    component.mountedVolumes = new Set();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
