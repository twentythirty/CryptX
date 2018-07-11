import { Component, OnInit } from '@angular/core';
import { TimelineDetailComponent, SingleTableDataSource } from '../timeline-detail/timeline-detail.component'
import { ActivatedRoute } from '@angular/router';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';

@Component({
  selector: 'app-investment-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class InvestmentRunDetailComponent extends TimelineDetailComponent implements OnInit {

  public pageTitle: string = 'Recipe run';
  public singleTitle: string = 'Investment run';
  public listTitle: string = 'Recipe runs';
  public addTitle: string = '+ Start new run';

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'one',
    'two',
    'three'
  ];

  public listDataSource: TableDataSource = {
    header: [
      { column: 'one', name: 'One', filter: { type: 'text', sortable: true }},
      { column: 'two', name: 'Two', filter: { type: 'text', sortable: true }},
      { column: 'three', name: 'Three', filter: { type: 'text', sortable: true }}
    ],
    body: null
  };

  public singleDataSource: SingleTableDataSource = {
    header: this.listDataSource.header.map(
      el => { return {
        column: el.column,
        name: el.name
      }}
    ),
    body: null
  }

  constructor(
    protected route: ActivatedRoute
  ) {
    super(route);
  }

  public getAllData(): void {
    this.listDataSource.body = [
      { one: 1, two: 2, three: 3 },
      { one: 1, two: 2, three: 3 },
      { one: 1, two: 2, three: 3 }
    ]
    this.count = 3;
  }

  public getSingleData(): void {
    this.singleDataSource.body = [
      { one: 1, two: 2, three: 3 }
    ]
  }

  public addAction(): void {
    alert('add?')
  }

  ngOnInit() {
    super.ngOnInit();
    this.timelineEvents = Array(5).fill(
      new TimelineEvent(
        'Investment run',
        'Orders filled',
        'IR-001, rci',
        '21 May, 2018 10:30'
      )
    )
  }

}
