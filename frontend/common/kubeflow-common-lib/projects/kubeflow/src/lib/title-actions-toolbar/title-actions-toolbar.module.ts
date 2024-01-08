import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleActionsToolbarComponent } from './title-actions-toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [TitleActionsToolbarComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [TitleActionsToolbarComponent],
})
export class TitleActionsToolbarModule {}
