import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  UntypedFormControl,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditorModule, RokService } from 'kubeflow';
import { NewVolumeComponent } from './new.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NewVolumeComponent', () => {
  let component: NewVolumeComponent;
  let fixture: ComponentFixture<NewVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewVolumeComponent],
      imports: [
        CommonModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        EditorModule,
      ],
      providers: [{ provide: RokService, useValue: {} }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVolumeComponent);
    component = fixture.componentInstance;
    component.volGroup = new UntypedFormGroup({
      newPvc: new UntypedFormControl(),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
