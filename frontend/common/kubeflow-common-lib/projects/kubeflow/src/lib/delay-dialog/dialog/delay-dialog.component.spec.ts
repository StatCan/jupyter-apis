import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DelayDialogComponent } from './delay-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DelayDialogModule } from '../delay-dialog.module';

describe('DelayDialogComponent', () => {
  let component: DelayDialogComponent;
  let fixture: ComponentFixture<DelayDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [DelayDialogModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              title: '',
              message: '',
              accept: '',
              applying: '',
              error: '',
              confirmColor: '',
              cancel: '',
              width: '',
            },
          },
        ],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
