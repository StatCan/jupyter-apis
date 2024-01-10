import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceTableComponent } from './resource-table.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import {
  MatLegacyPaginatorModule as MatPaginatorModule,
  MatLegacyPaginatorIntl as MatPaginatorIntl,
} from '@angular/material/legacy-paginator';
import { StatusComponent } from './status/status.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ActionComponent } from './action/action.component';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActionButtonComponent } from './action-button/action-button.component';
import { IconModule } from '../icon/icon.module';
import { TableComponent } from './table/table.component';
import { DateTimeModule } from '../date-time/date-time.module';
import { PopoverModule } from '../popover/popover.module';
import { TableChipsListComponent } from './chips-list/chips-list.component';
import { ComponentValueComponent } from './component-value/component-value.component';
import { PortalModule } from '@angular/cdk/portal';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { HelpPopoverModule } from '../help-popover/help-popover.module';
import { RouterModule } from '@angular/router';
import { getCustomPaginatorIntl } from './paginator/custom-paginator-intl';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatPaginatorModule,
    PortalModule,
    FontAwesomeModule,
    MatIconModule,
    IconModule,
    DateTimeModule,
    PopoverModule,
    MatSortModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    HelpPopoverModule,
    RouterModule,
  ],
  declarations: [
    ResourceTableComponent,
    StatusComponent,
    ActionComponent,
    ActionButtonComponent,
    TableChipsListComponent,
    TableComponent,
    ComponentValueComponent,
  ],
  exports: [ResourceTableComponent, TableComponent, ActionComponent],
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class ResourceTableModule {}
