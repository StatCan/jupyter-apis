import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { EditorModule, HeadingSubheadingRowModule } from 'kubeflow';

import {
  ConfigurationInfoDialogComponent,
  DialogData,
} from './configuration-info-dialog.component';
const data: DialogData = {
  config: {},
};

describe('ConfigurationInfoDialogComponent', () => {
  let component: ConfigurationInfoDialogComponent;
  let fixture: ComponentFixture<ConfigurationInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigurationInfoDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
      imports: [EditorModule, HeadingSubheadingRowModule, MatDialogModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
