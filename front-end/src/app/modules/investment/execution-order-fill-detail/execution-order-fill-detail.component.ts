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
  selector: 'app-execution-order-fill-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class ExecutionOrderFillDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Execution order fill';
  public singleTitle: string = 'Execution order';
  public listTitle: string = 'Execution order fill';

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', name: 'Id' },
      { column: 'instrument', name: 'Instrument' },
      { column: 'side', name: 'Side' },
      { column: 'type', name: 'Type' },
      { column: 'price', name: 'Price' },
      { column: 'quantity', name: 'Total quantity' },
      { column: 'fee', name: 'Exchange trading fee' },
      { column: 'status', name: 'Status' },
      { column: 'submission_time', name: 'Submission time' },
      { column: 'completion_time', name: 'Completion time' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'fill_time', name: 'Fill time', filter: {type: 'text', sortable: true }},
      { column: 'fill_price', name: 'Fill price', filter: {type: 'number', sortable: true }},
      { column: 'quantity', name: 'Quantity', filter: {type: 'number', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
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

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'fill_time' }),
    new NumberCellDataColumn({ column: 'fill_price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
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
        params => this.investmentService.getAllExecOrdersFills(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.execution_order_fills;
        this.count = res.count;
        this.setListFooter(res);
      },
      err => this.listDataSource.body = []
    )
  }

  protected getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleExecutionOrder(params['id'])
      )
    ).subscribe(
      res => {
        if(res.execution_order) {
          this.singleDataSource.body = [ res.execution_order ];
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
