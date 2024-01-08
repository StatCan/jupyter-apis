import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { EditorModule } from 'kubeflow';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ExistingVolumeComponent } from './existing-volume.component';
import { ExistingPvcModule } from './pvc/pvc.module';

describe('ExistingVolumeComponent', () => {
  let component: ExistingVolumeComponent;
  let fixture: ComponentFixture<ExistingVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExistingVolumeComponent],
      imports: [
        CommonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        ExistingPvcModule,
        NoopAnimationsModule,
        EditorModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingVolumeComponent);
    component = fixture.componentInstance;
    component.volGroup = new UntypedFormGroup({
      existingSource: new UntypedFormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
