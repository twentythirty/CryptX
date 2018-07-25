import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn, ConfirmCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { mergeMap, map } from 'rxjs/operators';
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
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'instrument', nameKey: 'table.header.instrument' },
      { column: 'side', nameKey: 'table.header.side' },
      { column: 'price', nameKey: 'table.header.price' },
      { column: 'quantity', nameKey: 'table.header.quantity' },
      { column: 'fee', nameKey: 'table.header.sum_of_exchange_trading_fee' },
      { column: 'status', nameKey: 'table.header.status' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: {type: 'text', sortable: true }},
      { column: 'instrument', nameKey: 'table.header.instrument', filter: {type: 'text', sortable: true }},
      { column: 'side', nameKey: 'table.header.side', filter: {type: 'text', sortable: true }},
      { column: 'type', nameKey: 'table.header.type', filter: {type: 'text', sortable: true }},
      { column: 'price', nameKey: 'table.header.price', filter: {type: 'number', sortable: true }},
      { column: 'quantity', nameKey: 'table.header.total_quantity', filter: {type: 'number', sortable: true }},
      { column: 'fee', nameKey: 'table.header.exchange_trading_fee', filter: {type: 'number', sortable: true }},
      { column: 'status', nameKey: 'table.header.status', filter: {type: 'text', sortable: true }},
      { column: 'submission_time', nameKey: 'table.header.submission_time', filter: {type: 'date', sortable: true }},
      { column: 'completion_time', nameKey: 'table.header.completion_time', filter: {type: 'date', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'instrument',
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      '51': StatusClass.PENDING,
      '52': StatusClass.DEFAULT,
      '53': StatusClass.APPROVED,
      '54': StatusClass.REJECTED,
      '55': StatusClass.REJECTED,
      '56': StatusClass.FAILED,
    }}}),
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'instrument',
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      '61': StatusClass.PENDING,
      '62': StatusClass.APPROVED,
      '63': StatusClass.APPROVED,
      '64': StatusClass.APPROVED,
      '65': StatusClass.REJECTED,
      '66': StatusClass.FAILED,
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
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllExecutionOrders(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.count = res.count;
        this.listDataSource.body = res.execution_orders;
        this.listDataSource.footer = res.footer;
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
        if(res.recipe_order_stats) {
          this.setTagLine(res.recipe_order_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`)
          }))
        }
      },
      err => this.singleDataSource.body = []
    )
  }

  protected getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getExecutionOrderStats(params['id'])
      )
    )
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
