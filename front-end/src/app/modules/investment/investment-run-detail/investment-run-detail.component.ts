import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TimelineDetailComponent, SingleTableDataSource } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-investment-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class InvestmentRunDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe run';
  public singleTitle: string = 'Investment run';
  public listTitle: string = 'Recipe runs';
  public addTitle: string = '+ Start new run';

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

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
    body: null,
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

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute
  ) {
    super(route);
  }

  /**
   * 4. Implement abstract methods to fetch data OnInit
   */
  public getAllData(): void {
    this.listDataSource.body = [
      { one: 1, two: 2, three: 3 },
      { one: 1, two: 2, three: 3 },
      { one: 1, two: 2, three: 3 }
    ]
    this.count = 3;
  }

  protected getSingleData(): void {
    this.singleDataSource.body = [
      { one: 1, two: 2, three: 3 }
    ]
  }

  protected getTimelineData(): void {
    this.timelineEvents = Array(5).fill(
      new TimelineEvent(
        'Investment run',
        'Orders filled',
        'IR-001, rci',
        '21 May, 2018 10:30'
      )
    )
  }

  /**
   * 5. Implement abstract methods to handle user actions
   */

  public addAction(): void {
    alert('add?')
  }

  public openSingleRow(row: any): void {
    // Navigate to a single item page
  }

  public openListRow(row: any): void {
    alert('Navigate to a row item page');
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }

}
