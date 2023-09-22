import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import {
  ContentListItemModule,
  DetailsListModule,
  LoadingSpinnerModule,
  PollerService,
  SnackBarModule,
} from 'kubeflow';
import { JWABackendService } from 'src/app/services/backend.service';
import { of } from 'rxjs';

import { OverviewComponent } from './overview.component';
import { mockPods } from './pods-mock';
import { mockGetPvcData } from '../pvc-mock';
import { mockPodGroups } from './pod-groups-mock';

const JWABackendServiceStub: Partial<JWABackendService> = {
  getPodsUsingPVC: () => of(mockPods),
};
const PollerServiceStub: Partial<PollerService> = {
  exponential: () => of(),
};

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverviewComponent],
      providers: [
        { provide: JWABackendService, useValue: JWABackendServiceStub },
        { provide: PollerService, useValue: PollerServiceStub },
      ],
      imports: [
        DetailsListModule,
        LoadingSpinnerModule,
        SnackBarModule,
        ContentListItemModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    component.pvc = mockGetPvcData.pvc;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct PodUrl according to group', () => {
    const newPodLink = 'newPodLink';
    let podLink = component[newPodLink]('podName', 'namespace', 'Notebooks');
    expect(podLink.url).toEqual('/notebook/details/namespace/podName/');
    podLink = component[newPodLink]('podName', 'namespace', 'InferenceService');
    expect(podLink.url).toEqual('/models/details/namespace/podName/');
  });

  it('should initialize correct podGroups', () => {
    const generatePodGroups = 'generatePodGroups';
    const groups = component[generatePodGroups](mockPods);
    const names = groups.map(group => group.name);
    expect(names).toContain('InferenceService');
  });

  it('should generate expected podGroups', () => {
    const podGroups = mockPodGroups;
    const pods = mockPods;
    const generatePodGroups = 'generatePodGroups';
    const newPodGroups = component[generatePodGroups](pods);
    expect(newPodGroups).toEqual(podGroups);
  });
});
