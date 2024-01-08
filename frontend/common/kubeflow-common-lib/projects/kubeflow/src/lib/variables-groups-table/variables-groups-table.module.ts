import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariablesGroupsTableComponent } from './variables-groups-table.component';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

@NgModule({
  declarations: [VariablesGroupsTableComponent],
  imports: [CommonModule, MatChipsModule],
  exports: [VariablesGroupsTableComponent],
})
export class VariablesGroupsTableModule {}
