import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    component.metadataGroup = new FormGroup({
      name: new FormControl(''),
    });
    component.mountedVolumes = new Set();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
