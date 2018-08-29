import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDetailComponent, SingleTableDataSource } from './timeline-detail.component';
import { TableDataSource } from '../../../shared/components/data-table/data-table.component';

class TimelineDetailComponentClass extends TimelineDetailComponent {
  pageTitle = '';
  singleTitle = '';
  listTitle = '';

  singleDataSource: SingleTableDataSource = {
    header: [{column: 'id', nameKey: 'namekey'}],
    body: null
  };
  listDataSource: TableDataSource = {
    header: [{column: 'id', nameKey: 'namekey'}],
    body: null
  };

  singleColumnsToShow = [];
  listColumnsToShow = [];

  getAllData(){}
  getSingleData(){}
  getTimelineData(){}
  openSingleRow(){}
  openListRow(){}
}

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
    fixture = TestBed.createComponent(TimelineDetailComponentClass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
