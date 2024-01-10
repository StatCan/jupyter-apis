import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatusIconComponent } from './status-icon.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [StatusIconComponent],
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  exports: [StatusIconComponent],
})
export class StatusIconModule {}
