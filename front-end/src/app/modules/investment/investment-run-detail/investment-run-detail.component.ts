import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent, StatusClass } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellComponent, BooleanCellComponent, DateCellDataColumn, BooleanCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';

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
  public addTitle: string = 'Start new run';

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
      { column: 'decision_by', name: 'desicion_by', filter: {type: 'text', sortable: true }},
      { column: 'decision_time', name: 'decision_time', filter: {type: 'text', sortable: true }},
      { column: 'rationale', name: 'rationale', filter: {type: 'text', sortable: true }},
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'started' }),
    new DateCellDataColumn({ column: 'updated' }),
    new DateCellDataColumn({ column: 'completed' }),
    'creator',
    'strategy',
    new BooleanCellDataColumn({ column: 'simulated' }),
    new NumberCellDataColumn({ column: 'deposit' }),
    'status',
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'created' }),
    'creator',
    'status',
    'decision_by',
    new DateCellDataColumn({ column: 'decision_time' }),
    new ActionCellDataColumn({ column: 'rationale', inputs: {
        actions: [
          new DataCellAction({
            label: 'READ',
            exec: (row: any) => { this.readRationale(<any>row) }
          })
        ]
      }
    }),
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
      { id: 'IR-3224', created: Date.now(), creator: 'John Doe', status: 'Rejected', decision_by: 'John Doe', decision_time: Date.now(), rationale: 'Lipsum' }
    ]
    this.count = 3;
  }

  protected getSingleData(): void {
    this.singleDataSource.body = [
      { id: 'IR-3224', started: Date.now(), updated: Date.now(), completed: Date.now(), creator: 'John Doe', strategy: 'LCI', simulated: false, deposit: 120000, status: 'Orders Executing' }
    ]
  }

  protected getTimelineData(): void {
    this.timelineEvents = [
      ...Array(2).fill(
        new TimelineEvent(
          'Investment run',
          'Orders filled',
          StatusClass.APPROVED,
          'IR-001, rci',
          (new Date()).toUTCString(),
          `/dashboard`
        )
      ),
      ...Array(3).fill(
        { note: 'Investments isn\'t made yet' }
      )
    ]
    this.setTagLine([
      new TagLineItem(`${0} Orders`, () => alert('Open Orders')),
      new TagLineItem(`${0} Execution orders`, () => alert('Open Execution orders')),
      new TagLineItem(`${0} Deposits`, () => alert('Open Deposits'))
    ]);
  }

  /**
   * 5. Implement abstract methods to handle user actions
   */

  public addAction(): void {
    this.listDataSource.body.push({
      ...this.listDataSource.body[0]
    })
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
    alert(row.rationale)
  }

}
