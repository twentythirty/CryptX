import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn, ConfirmCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { mergeMap } from 'rxjs/operators';
import { InvestmentService } from '../../../services/investment/investment.service';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-order-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class OrderDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe orders';
  public singleTitle: string = 'Recipe run';
  public listTitle: string = 'Orders';

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
      { column: 'rationale', name: 'Rationale' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'instrument', name: 'Instrument', filter: {type: 'text', sortable: true }},
      { column: 'side', name: 'Side', filter: {type: 'text', sortable: true }},
      { column: 'price', name: 'Price', filter: {type: 'number', sortable: true }},
      { column: 'quantity', name: 'Quantity', filter: {type: 'number', sortable: true }},
      { column: 'fee', name: 'Sum of exchange trading fee', filter: {type: 'number', sortable: true }},
      { column: 'status', name: 'Status', filter: {type: 'text', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'creation_time' }),
    'instrument',
    'creator',
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'pending' : StatusClass.PENDING,
      'rejected': StatusClass.REJECTED,
      'approved': StatusClass.APPROVED
    }}}),
    'decision_by',
    new DateCellDataColumn({ column: 'decision_time' }),
    'rationale'
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'instrument',
    'side',
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'pending' : StatusClass.PENDING,
      'rejected': StatusClass.REJECTED,
      'approved': StatusClass.APPROVED
    }}})
  ];

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private investmentService: InvestmentService
  ) {
    super(route);
  }

  /**
   * 4. Implement abstract methods to fetch data OnInit
   */
  public getAllData(): void {
    console.log(this.requestData);
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllOrders(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.recipe_orders;
        this.count = res.count;
      },
      err => this.listDataSource.body = []
    )
  }

  protected getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleRecipe(params['id'])
      )
    ).subscribe(
      res => {
        if(res.recipe_run) {
          this.singleDataSource.body = [ res.recipe_run ];
        }
      },
      err => this.singleDataSource.body = []
    )
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

}
