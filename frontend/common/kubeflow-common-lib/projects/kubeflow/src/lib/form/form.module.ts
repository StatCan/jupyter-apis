import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import {
  MatLegacySpinner as MatSpinner,
  MatLegacyProgressSpinnerModule as MatProgressSpinnerModule,
} from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { FormSectionComponent } from './section/section.component';

import { NameNamespaceInputsComponent } from './name-namespace-inputs/name-namespace-inputs.component';
import { NameInputComponent } from './name-namespace-inputs/name-input/name-input.component';
import { IconModule } from '../icon/icon.module';
import { PositiveNumberInputComponent } from './positive-number-input/positive-number-input.component';
import { RokUrlInputComponent } from './rok-url-input/rok-url-input.component';
import { AdvancedOptionsComponent } from './advanced-options/advanced-options.component';
import { PopoverModule } from '../popover/popover.module';
import { SubmitBarComponent } from './submit-bar/submit-bar.component';
import { StepInfoComponent } from './step-info/step-info.component';

@NgModule({
  declarations: [
    FormSectionComponent,
    NameNamespaceInputsComponent,
    NameInputComponent,
    PositiveNumberInputComponent,
    RokUrlInputComponent,
    AdvancedOptionsComponent,
    SubmitBarComponent,
    StepInfoComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    MatTooltipModule,
    IconModule,
    MatProgressSpinnerModule,
    PopoverModule,
    MatIconModule,
  ],
  exports: [
    FormSectionComponent,
    NameNamespaceInputsComponent,
    NameInputComponent,
    PositiveNumberInputComponent,
    RokUrlInputComponent,
    AdvancedOptionsComponent,
    SubmitBarComponent,
    StepInfoComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatIconModule,
    MatDividerModule,
  ],
})
export class FormModule {}
