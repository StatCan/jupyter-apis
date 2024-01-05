import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NameInputComponent } from './name-input.component';
import { UntypedFormControl } from '@angular/forms';
import { FormModule } from '../../form.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('NameInputComponent', () => {
  let component: NameInputComponent;
  let fixture: ComponentFixture<NameInputComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [FormModule, BrowserAnimationsModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NameInputComponent);
    component = fixture.componentInstance;
    component.nameControl = new UntypedFormControl();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
