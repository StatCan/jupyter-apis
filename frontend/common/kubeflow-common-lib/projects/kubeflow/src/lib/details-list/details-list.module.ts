import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DetailsListComponent } from './details-list.component';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { DetailsListItemComponent } from './details-list-item/details-list-item.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [DetailsListComponent, DetailsListItemComponent],
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    MatRippleModule,
  ],
  exports: [DetailsListComponent, DetailsListItemComponent],
})
export class DetailsListModule {}
