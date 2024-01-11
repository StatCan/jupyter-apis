import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { of } from 'rxjs';
import { JWABackendService } from 'src/app/services/backend.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StorageClassComponent } from './storage-class.component';

const JWABackendServiceStub: Partial<JWABackendService> = {
  getStorageClasses: () => of([]),
  getDefaultStorageClass: () => of(),
};

describe('StorageClassComponent', () => {
  let component: StorageClassComponent;
  let fixture: ComponentFixture<StorageClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StorageClassComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: JWABackendService, useValue: JWABackendServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageClassComponent);
    component = fixture.componentInstance;
    component.scControl = new UntypedFormControl();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
