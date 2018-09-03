import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InvestmentModule } from '../investment.module';
import { TimelineDetailComponent } from './timeline-detail.component';

describe('TimelineDetailComponent', () => {
  let component: TimelineDetailComponent;
  let fixture: ComponentFixture<TimelineDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ]
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
