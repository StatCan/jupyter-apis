import { TestBed } from '@angular/core/testing';

import { FormDialogService } from './form-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogModule } from './form-dialog.module';

describe('FormDialogService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [FormDialogModule],
      providers: [MatDialog],
    }),
  );

  it('should be created', () => {
    const service: FormDialogService = TestBed.inject(FormDialogService);
    expect(service).toBeTruthy();
  });
});
