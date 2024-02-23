import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { KubeflowModule } from 'kubeflow';
import { of } from 'rxjs';
import { JWABackendService } from 'src/app/services/backend.service';

import { VolumeFormComponent } from './volume-form.component';

const JWABackendServiceStub: Partial<JWABackendService> = {
  getStorageClasses: () => of(),
  getDefaultStorageClass: () => of(),
  getPVCs: () => of(),
  createPVC: () => of(),
};
const FormBuilderStub: Partial<FormBuilder> = {
  group: () => mockFormGroup,
};

function getFormDefaults(): FormGroup {
  const fb = new FormBuilder();

  return fb.group({
    type: ['empty', [Validators.required]],
    name: ['', [Validators.required]],
    namespace: ['', [Validators.required]],
    size: [10, []],
    class: ['$empty', [Validators.required]],
    mode: ['ReadWriteOnce', [Validators.required]],
  });
}
const mockFormGroup: FormGroup = getFormDefaults();

describe('VolumeFormComponent', () => {
  let component: VolumeFormComponent;
  let fixture: ComponentFixture<VolumeFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VolumeFormComponent],
      providers: [
        { provide: FormBuilder, useValue: FormBuilderStub },
        { provide: JWABackendService, useValue: JWABackendServiceStub },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [KubeflowModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
