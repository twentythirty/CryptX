import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn } from '../../../shared/components/data-table-cells';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-recipe-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class RecipeRunDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe run';
  public singleTitle: string = 'Recipe runs';
  public listTitle: string = 'Recipe run details';

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', name: 'Id' },
      { column: 'creation_time', name: 'Creation time' },
      { column: 'instrument', name: 'Instrument' },
      { column: 'creator', name: 'Creator' },
      { column: 'status', name: 'Status' },
      { column: 'decision_by', name: 'Decision by' },
      { column: 'decision_time', name: 'Decision time' },
      { column: 'rationale', name: 'Rationale' },
      { column: 'actions', name: 'Actions' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'transaction_asset', name: 'Transaction asset', filter: {type: 'text', sortable: true }},
      { column: 'quote_asset', name: 'Quote asset', filter: {type: 'text', sortable: true }},
      { column: 'exchange', name: 'Exchange', filter: {type: 'text', sortable: true }},
      { column: 'percentage', name: 'Percentage, %', filter: {type: 'text', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'creation_time' }),
    'instrument',
    'creator',
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: (val) => {
      return StatusClass.PENDING;
    }}}),
    'decision_by',
    new DateCellDataColumn({ column: 'decision_time' }),
    'rationale',
    'actions',  // TODO: Actions component
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'transaction_asset',
    'quote_asset',
    'exchange',
    new PercentCellDataColumn({ column: 'percentage' })
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
      {
        id: 'IR-3242',
        transaction_asset: 'BTC',
        quote_asset: 'ETH',
        exchange: 'Bitstamp',
        percentage: 5.11,
      }
    ]
    this.count = 3;
  }

  protected getSingleData(): void {
    this.singleDataSource.body = [
      {
        id: 'IR-3242',
        creation_time: Date.now(),
        instrument: 'BTC/ETH',
        creator: 'John Doe',
        status: 'Pending',
        decision_by: null,
        decision_time: null,
        rationale: null
      }
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
      new TagLineItem(`${0} Orders`),
      new TagLineItem(`${0} Execution orders`),
      new TagLineItem(`${0} Deposits`)
    ]);
  }

  /**
   * 5. Implement abstract methods to handle user actions
   */

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

}
