import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TimelineDetailComponent, SingleTableDataSource } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction } from '../../../shared/components/data-table-cells';

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

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', name: 'id' },
      { column: 'started', name: 'started' },
      { column: 'updated', name: 'updated' },
      { column: 'completed', name: 'completed' },
      { column: 'creator', name: 'creator' },
      { column: 'strategy', name: 'strategy' },
      { column: 'simulated', name: 'simulated' },
      { column: 'deposit', name: 'deposit' },
      { column: 'status', name: 'status' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'id', filter: {type: 'text', sortable: true }},
      { column: 'created', name: 'created', filter: {type: 'text', sortable: true }},
      { column: 'creator', name: 'creator', filter: {type: 'text', sortable: true }},
      { column: 'status', name: 'status', filter: {type: 'text', sortable: true }},
      { column: 'desicion_by', name: 'desicion_by', filter: {type: 'text', sortable: true }},
      { column: 'decision_time', name: 'decision_time', filter: {type: 'text', sortable: true }},
      { column: 'rationale', name: 'rationale', filter: {type: 'text', sortable: true }},
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    ...this.singleDataSource.header.map(
      h => h.column
    )
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    ...this.listDataSource.header.map(
      h => h.column
    ).map(
      h => h == 'rationale' ? new ActionCellDataColumn({ column: h, inputs: {
        actions: [
          new DataCellAction({
            label: 'READ',
            exec: (row: any) => { this.readRationale(<any>row) }
          })
        ]
      } }) : h
    ),
  ];

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
    this.setTagLine(0, 0, 0);
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

  /**
   * Additional
   */

  public readRationale(row): void {
    alert('Reading rationale...')
  }

}
