import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuIconComponent } from './menu-icon.component';
import { MenuIconValue } from '../types';
import { ResourceTableModule } from '../resource-table.module';

describe('ActionComponent', () => {
  let component: MenuIconComponent;
  let fixture: ComponentFixture<MenuIconComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ResourceTableModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuIconComponent);
    component = fixture.componentInstance;
    component.action = new MenuIconValue({
      name: '',
      color: '',
      matIcon: '',
      tooltip: '',
    });
    component.data = {};

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
