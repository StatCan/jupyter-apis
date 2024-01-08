import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { VolumeAccessModesComponent } from './access-modes.component';

describe('VolumeAccessModesComponent', () => {
  let component: VolumeAccessModesComponent;
  let fixture: ComponentFixture<VolumeAccessModesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeAccessModesComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatRadioModule,
        MatTooltipModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeAccessModesComponent);
    component = fixture.componentInstance;
    component.modesCtrl = new UntypedFormControl('test');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
