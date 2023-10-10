import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    const fakeData = new FormGroup({
      prob: new FormControl(),
      datavols: new FormArray([
        new FormGroup({
          existingSource: new FormGroup({
            persistantVolumeClaim: new FormGroup({
              readOnly: new FormControl(),
              claimName: new FormControl(),
            }),
          }),
        }),
      ]),
    });

    component.pvcGroup = (fakeData.get('datavols') as FormArray)
      .at(0)
      .get('existingSource')
      .get('persistantVolumeClaim') as FormGroup;
    component.mountedVolumes = new Set();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
