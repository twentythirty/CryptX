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
  selector: 'app-execution-order-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class ExecutionOrderDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Execution orders';
  public singleTitle: string = 'Order';
  public listTitle: string = 'Execution orders';

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', name: 'Id' },
      { column: 'instrument', name: 'Instrument' },
      { column: 'side', name: 'Side' },
      { column: 'price', name: 'Price' },
      { column: 'quantity', name: 'Quantity' },
      { column: 'fee', name: 'Sum of exchange trading fee' },
      { column: 'status', name: 'Status' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'instrument', name: 'Instrument', filter: {type: 'text', sortable: true }},
      { column: 'side', name: 'Side', filter: {type: 'text', sortable: true }},
      { column: 'type', name: 'Type', filter: {type: 'text', sortable: true }},
      { column: 'price', name: 'Price', filter: {type: 'number', sortable: true }},
      { column: 'quantity', name: 'Total quantity', filter: {type: 'number', sortable: true }},
      { column: 'fee', name: 'Exchange trading fee', filter: {type: 'number', sortable: true }},
      { column: 'status', name: 'Status', filter: {type: 'text', sortable: true }},
      { column: 'submission_time', name: 'Submission time', filter: {type: 'date', sortable: true }},
      { column: 'completion_time', name: 'Completion time', filter: {type: 'date', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
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

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'instrument',
    'side',
    'type',
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'pending' : StatusClass.PENDING,
      'rejected': StatusClass.REJECTED,
      'approved': StatusClass.APPROVED
    }}}),
    new DateCellDataColumn({ column: 'submission_time' }),
    new DateCellDataColumn({ column: 'completion_time' })
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
        params => this.investmentService.getAllExecutionOrders(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.execution_orders;
        this.count = res.count;
      },
      err => this.listDataSource.body = []
    )
  }

  protected getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleOrder(params['id'])
      )
    ).subscribe(
      res => {
        if(res.recipe_order) {
          this.singleDataSource.body = [ res.recipe_order ];
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
    // Do nothing
  }

  public openListRow(row: any): void {
    this.router.navigate([`/run/execution-order-fill/${row.id}`])
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }

}
