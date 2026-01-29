import { TestBed } from '@angular/core/testing';

import { DelayDialogService } from './delay-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { DelayDialogModule } from './delay-dialog.module';

describe('DelayDialogService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [DelayDialogModule],
      providers: [MatDialog],
    }),
  );

  it('should be created', () => {
    const service: DelayDialogService = TestBed.inject(DelayDialogService);
    expect(service).toBeTruthy();
  });
});
