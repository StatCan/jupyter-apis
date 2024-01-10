import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [LoadingSpinnerComponent],
  imports: [CommonModule, MatProgressSpinnerModule],
  exports: [LoadingSpinnerComponent],
})
export class LoadingSpinnerModule {}
