import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { VolumeNameComponent } from './name.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';

describe('VolumeNameComponent', () => {
  let component: VolumeNameComponent;
  let fixture: ComponentFixture<VolumeNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeNameComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        NoopAnimationsModule,
        MatSnackBarModule,
      ],
      providers: [{ provide: HttpClient, useValue: {} }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeNameComponent);
    component = fixture.componentInstance;
    component.metadataGroup = new UntypedFormGroup({
      name: new UntypedFormControl(''),
    });
    component.mountedVolumes = new Set();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
