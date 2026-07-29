import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeComponent } from './size.component';

const mockElement = {
  age: 'Mon, 19 Sep 2022 16:39:10 GMT',
  capacity: '5Gi',
  pendingSize: '10Gi',
  class: '',
  modes: ['ReadWriteOnce'],
  name: 'a0-new-image-workspace-d8pc2',
  namespace: 'kubeflow-user',
  notebooks: ['a0-new-image'],
  status: {
    message: 'Bound',
    phase: 'ready',
    state: '',
  },
  viewer: 'uninitialized',
};

describe('SizeComponent', () => {
  let component: SizeComponent;
  let fixture: ComponentFixture<SizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SizeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeComponent);
    component = fixture.componentInstance;
    component.element = mockElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
