import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WarningComponent } from './warning-icon.component';

describe('WarningComponent', () => {
  let component: WarningComponent;
  let fixture: ComponentFixture<WarningComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WarningComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
