import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadingSubheadingRowComponent } from './heading-subheading-row.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [HeadingSubheadingRowComponent],
  imports: [CommonModule, MatTooltipModule],
  exports: [HeadingSubheadingRowComponent],
})
export class HeadingSubheadingRowModule {}
