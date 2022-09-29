import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSectionImageComponent } from './section.image.component';
import { FormModule } from '../form.module';

describe('FormSectionImageComponent', () => {
  let component: FormSectionImageComponent;
  let fixture: ComponentFixture<FormSectionImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSectionImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
