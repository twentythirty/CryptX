import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDetailComponent } from './timeline-detail.component';

describe('TimelineDetailComponent', () => {
  let component: TimelineDetailComponent;
  let fixture: ComponentFixture<TimelineDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
