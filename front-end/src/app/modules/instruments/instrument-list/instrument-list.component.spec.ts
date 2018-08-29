import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentListComponent } from './instrument-list.component';

describe('InstrumentListComponent', () => {
  let component: InstrumentListComponent;
  let fixture: ComponentFixture<InstrumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstrumentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
