import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoppedTimeComponent } from './stopped-time.component';

describe('StoppedTimeComponent', () => {
  let component: StoppedTimeComponent;
  let fixture: ComponentFixture<StoppedTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StoppedTimeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoppedTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
