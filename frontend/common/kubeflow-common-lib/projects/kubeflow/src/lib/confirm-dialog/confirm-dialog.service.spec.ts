import { TestBed } from '@angular/core/testing';

import { ConfirmDialogService } from './confirm-dialog.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmDialogModule } from './confirm-dialog.module';

describe('ConfirmDialogService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ConfirmDialogModule],
      providers: [MatDialog],
    }),
  );

  it('should be created', () => {
    const service: ConfirmDialogService = TestBed.inject(ConfirmDialogService);
    expect(service).toBeTruthy();
  });
});
