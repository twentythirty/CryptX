import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentInfoComponent } from './instrument-info.component';

describe('InstrumentInfoComponent', () => {
  let component: InstrumentInfoComponent;
  let fixture: ComponentFixture<InstrumentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstrumentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
