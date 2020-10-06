import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VolumeTableComponent } from "./volume-table.component";

describe("VolumeTableComponent", () => {
  let component: VolumeTableComponent;
  let fixture: ComponentFixture<VolumeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VolumeTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
