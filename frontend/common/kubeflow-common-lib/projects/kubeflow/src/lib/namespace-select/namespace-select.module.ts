import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NamespaceSelectComponent } from './namespace-select.component';
import { SnackBarModule } from '../snack-bar/snack-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    SnackBarModule,
  ],
  declarations: [NamespaceSelectComponent],
  exports: [NamespaceSelectComponent],
})
export class NamespaceSelectModule {}
