import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VolumeMountComponent } from './mount.component';

describe('VolumeMountComponent', () => {
  let component: VolumeMountComponent;
  let fixture: ComponentFixture<VolumeMountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeMountComponent],
      imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatCheckboxModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeMountComponent);
    component = fixture.componentInstance;
    component.volGroup = new UntypedFormGroup({
      mount: new UntypedFormControl(),
      newPvc: new UntypedFormControl({
        metadata: {},
      }),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
