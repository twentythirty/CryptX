import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RationaleModalComponent } from './rationale-modal.component';

describe('RationaleModalComponent', () => {
  let component: RationaleModalComponent;
  let fixture: ComponentFixture<RationaleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RationaleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RationaleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
