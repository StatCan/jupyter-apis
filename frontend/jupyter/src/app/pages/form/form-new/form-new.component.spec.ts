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
import { FormAdvancedOptionsModule } from './form-advanced-options/form-advanced-options.module';
import { FormAffinityTolerationsModule } from './form-affinity-tolerations/form-affinity-tolerations.module';
import { FormConfigurationsModule } from './form-configurations/form-configurations.module';
import { FormCpuRamModule } from './form-cpu-ram/form-cpu-ram.module';
import { FormDataVolumesModule } from './form-data-volumes/form-data-volumes.module';
import { FormGpusModule } from './form-gpus/form-gpus.module';
import { FormImageModule } from './form-image/form-image.module';
import { FormImageCustomModule } from './form-image-custom/form-image-custom.module';
import { FormNameModule } from './form-name/form-name.module';
import { FormNewComponent } from './form-new.component';
import { FormProtectedBModule } from './form-protected-b/form-protected-b.module';
import { FormWorkspaceVolumeModule } from './form-workspace-volume/form-workspace-volume.module';
import { VolumeModule } from './volume/volume.module';

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
  let component: FormNewComponent;
  let fixture: ComponentFixture<FormNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormNewComponent],
      imports: [
        CommonModule,
        KfFormModule,
        TitleActionsToolbarModule,
        VolumeModule,
        FormWorkspaceVolumeModule,
        FormDataVolumesModule,
        FormCpuRamModule,
        FormGpusModule,
        FormConfigurationsModule,
        FormAffinityTolerationsModule,
        FormAdvancedOptionsModule,
        FormImageModule,
        FormImageCustomModule,
        FormNameModule,
        FormProtectedBModule,
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
    fixture = TestBed.createComponent(FormNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add the OneLake configuration when selected', () => {
    component.formCtrl.patchValue({
      name: 'test-notebook',
      namespace: 'kubeflow-user',
      image: 'registry/jupyterlab-cpu:latest',
      cpu: 1,
      cpuLimit: 1,
      memory: 1,
      memoryLimit: 1,
      configurations: [],
      onelake: true,
      onelakeWorkspace: ' workspace-guid ',
      onelakeLakehouse: ' lakehouse-guid ',
    });

    const notebook = component.getSubmitNotebook();

    expect(notebook.configurations).toContain('onelake-fuse');
    expect(notebook.onelake).toBeTrue();
    expect(notebook.onelakeWorkspace).toBe('workspace-guid');
    expect(notebook.onelakeLakehouse).toBe('lakehouse-guid');
  });
});
