import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import {
  BackendService,
  ConfirmDialogService,
  KubeflowModule,
  NamespaceService,
  PollerService,
  SnackBarService,
} from 'kubeflow';
import { Observable, of } from 'rxjs';
import { IndexDefaultModule } from './index-default/index-default.module';
import { IndexRokModule } from './index-rok/index-rok.module';
import { JWABackendService } from 'src/app/services/backend.service';
import { KubecostService } from 'src/app/services/kubecost.service';

import { IndexComponent } from './index.component';

const JWABackendServiceStub: Partial<JWABackendService> = {
  getPVCs: () => of(),
};
const SnackBarServiceStub: Partial<SnackBarService> = {
  open: () => {},
  close: () => {},
};
const NamespaceServiceStub: Partial<NamespaceService> = {
  getSelectedNamespace: () => of(),
  getSelectedNamespace2: () => of(),
};
const KubecostServiceStub: Partial<KubecostService> = {
  getAllocationCost: () => of(),
};
const MockBackendService: Partial<BackendService> = {
  getNamespaces(): Observable<string[]> {
    return of([]);
  },
};

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IndexComponent],
      imports: [
        CommonModule,
        IndexRokModule,
        IndexDefaultModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatSnackBarModule,
        RouterTestingModule,
        MatDialogModule,
        KubeflowModule,
      ],
      providers: [
        { provide: ConfirmDialogService, useValue: {} },
        { provide: JWABackendService, useValue: JWABackendServiceStub },
        { provide: SnackBarService, useValue: SnackBarServiceStub },
        { provide: NamespaceService, useValue: NamespaceServiceStub },
        { provide: PollerService, useValue: {} },
        { provide: BackendService, useValue: MockBackendService },
        { provide: KubecostService, useValue: KubecostServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
