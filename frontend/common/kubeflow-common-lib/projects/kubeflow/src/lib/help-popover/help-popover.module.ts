import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from '../popover/popover.module';
import { HelpPopoverComponent } from './help-popover.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

@NgModule({
  declarations: [HelpPopoverComponent],
  imports: [
    CommonModule,
    PopoverModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
  ],
  exports: [HelpPopoverComponent],
})
export class HelpPopoverModule {}
