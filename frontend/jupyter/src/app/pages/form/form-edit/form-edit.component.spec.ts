import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
  FormModule as KfFormModule,
  NamespaceService,
  SnackBarService,
  TitleActionsToolbarModule,
} from 'kubeflow';
import { of } from 'rxjs';
import { JWABackendService } from 'src/app/services/backend.service';
import { FormEditComponent } from './form-edit.component';

const JWABackendServiceStub = {
  getConfig: () => of(),
  createNotebook: () => of(),
  getGPUVendors: () => of(),
  getStorageClasses: () => of(),
  getDefaultStorageClass: () => of(),
};

const NamespaceServiceStub = {
  getSelectedNamespace: () => of(),
  getSelectedNamespace2: () => of(),
};

const SnackBarServiceStub = {
  open: () => {},
  close: () => {},
};

describe('FormNewComponent', () => {
  let component: FormEditComponent;
  let fixture: ComponentFixture<FormEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormEditComponent],
      imports: [
        CommonModule,
        KfFormModule,
        TitleActionsToolbarModule,
        HttpClientModule,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: JWABackendService, useValue: JWABackendServiceStub },
        { provide: NamespaceService, useValue: NamespaceServiceStub },
        { provide: SnackBarService, useValue: SnackBarServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
