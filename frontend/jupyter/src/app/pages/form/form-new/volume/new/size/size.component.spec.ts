import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VolumeSizeComponent } from './size.component';

describe('VolumeSizeComponent', () => {
  let component: VolumeSizeComponent;
  let fixture: ComponentFixture<VolumeSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeSizeComponent],
      imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeSizeComponent);
    component = fixture.componentInstance;
    component.sizeCtrl = new UntypedFormControl('');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
