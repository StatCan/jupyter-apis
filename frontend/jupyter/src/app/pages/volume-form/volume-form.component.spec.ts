import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
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
const FormBuilderStub: Partial<UntypedFormBuilder> = {
  group: () => mockFormGroup,
};

function getFormDefaults(): UntypedFormGroup {
  const fb = new UntypedFormBuilder();

  return fb.group({
    type: ['empty', [Validators.required]],
    name: ['', [Validators.required]],
    namespace: ['', [Validators.required]],
    size: [10, []],
    class: ['$empty', [Validators.required]],
    mode: ['ReadWriteOnce', [Validators.required]],
  });
}
const mockFormGroup: UntypedFormGroup = getFormDefaults();

describe('VolumeFormComponent', () => {
  let component: VolumeFormComponent;
  let fixture: ComponentFixture<VolumeFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VolumeFormComponent],
      providers: [
        { provide: UntypedFormBuilder, useValue: FormBuilderStub },
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
