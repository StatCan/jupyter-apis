/* This code was developed by @tasos-ale */
import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { PopoverDirective } from './popover.directive';
import { PopoverComponent } from './popover.component';

@NgModule({
  imports: [PortalModule, OverlayModule, MatCardModule],
  exports: [PopoverDirective],
  declarations: [PopoverDirective, PopoverComponent],
})
export class PopoverModule {}
