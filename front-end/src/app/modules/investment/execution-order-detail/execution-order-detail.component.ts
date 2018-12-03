import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, finalize } from 'rxjs/operators';

import { StatusClass } from '../../../shared/models/common';

import {
  TimelineDetailComponent,
  SingleTableDataSource,
  TagLineItem,
  ITimelineDetailComponent
} from '../timeline-detail/timeline-detail.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { DateCellDataColumn, StatusCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { InvestmentService } from '../../../services/investment/investment.service';


/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-execution-order-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class ExecutionOrderDetailComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {

  /**
   * 1. Implement attributes to display titles
   */
  public pageTitle = 'Execution orders';
  public singleTitle = 'Order';
  public listTitle = 'Execution orders';

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'instrument', nameKey: 'table.header.instrument' },
      { column: 'side', nameKey: 'table.header.side' },
      { column: 'exchange', nameKey: 'table.header.exchange' },
      { column: 'price', nameKey: 'table.header.price' },
      { column: 'quantity', nameKey: 'table.header.total_quantity' },
      { column: 'filled_quantity', nameKey: 'table.header.filled_order_quantity' },
      { column: 'spend_amount', nameKey: 'table.header.spend_amount' },
      { column: 'sum_of_exchange_trading_fee', nameKey: 'table.header.sum_of_exchange_trading_fee' },
      { column: 'status', nameKey: 'table.header.status' }
    ],
    body: null
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({column: 'id' }),
    new TableDataColumn({column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new TableDataColumn({ column: 'exchange' }),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'filled_quantity' }),
    new NumberCellDataColumn({ column: 'spend_amount' }),
    new NumberCellDataColumn({ column: 'sum_of_exchange_trading_fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'orders.status.51': StatusClass.PENDING,
      'orders.status.52': StatusClass.DEFAULT,
      'orders.status.53': StatusClass.APPROVED,
      'orders.status.54': StatusClass.REJECTED,
      'orders.status.55': StatusClass.REJECTED,
      'orders.status.56': StatusClass.FAILED,
    }}}),
  ];

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true }},
      { column: 'instrument', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true }},
      { column: 'side', nameKey: 'table.header.side', filter: { type: 'text', sortable: true, inputSearch: false }},
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true }},
      { column: 'type', nameKey: 'table.header.type', filter: { type: 'text', sortable: true, inputSearch: false }},
      { column: 'price', nameKey: 'table.header.price', filter: { type: 'number', sortable: true }},
      { column: 'total_quantity', nameKey: 'table.header.total_quantity', filter: { type: 'number', sortable: true }},
      { column: 'filled_quantity', nameKey: 'table.header.filled_quantity', filter: { type: 'number', sortable: true }},
      { column: 'spend_amount', nameKey: 'table.header.total_spend_amount', filter: { type: 'number', sortable: true }},
      { column: 'exchange_trading_fee', nameKey: 'table.header.exchange_trading_fee', filter: { type: 'number', sortable: true }},
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true, inputSearch: false  }},
      // { column: 'submission_time', nameKey: 'table.header.submission_time', filter: { type: 'date', sortable: true }},
      // { column: 'completion_time', nameKey: 'table.header.completion_time', filter: { type: 'date', sortable: true }}
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({column: 'id' }),
    new TableDataColumn({column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side' }),
    new TableDataColumn({ column: 'exchange' }),
    new StatusCellDataColumn({ column: 'type' }),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'total_quantity' }),
    new NumberCellDataColumn({ column: 'filled_quantity' }),
    new NumberCellDataColumn({ column: 'spend_amount' }),
    new NumberCellDataColumn({ column: 'exchange_trading_fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'execution_orders.status.61': StatusClass.PENDING,
      'execution_orders.status.62': StatusClass.INPROGRESS,
      'execution_orders.status.63': StatusClass.FULLYFILLED,
      'execution_orders.status.64': StatusClass.PARTIALLYFILLED,
      'execution_orders.status.66': StatusClass.FAILED,
      'execution_orders.status.67': StatusClass.NOTFILLED
    }}}),
    // new DateCellDataColumn({ column: 'submission_time' }),
    // new DateCellDataColumn({ column: 'completion_time' })
  ];

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private investmentService: InvestmentService,
  ) {
    super(route, router);
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }

  /**
    * Add a rowData$ Observable to text and boolean column filters
    */
  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id', 'instrument', 'side', 'exchange', 'type', 'status'].includes(col.column)
    ).map(
      col => {
        const filter = { filter : { recipe_order_id: this.routeParamId }};
        col.filter.rowData$ = this.investmentService.getAllExecutionOrdersHeaderLOV(col.column, filter);
      }
    );
  }

  /**
   * 4. Implement methods to fetch data OnInit
   */
  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllExecutionOrders(params['id'], this.requestData).pipe(
          finalize(() => this.stopTableLoading())
        )
      )
    ).subscribe(
      res => {
        Object.assign(this.listDataSource, {
          body: res.execution_orders,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      },
      err => this.listDataSource.body = []
    );
  }

  public getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleOrder(params['id'])
      )
    ).subscribe(
      res => {
        if (res.recipe_order) {
          this.singleDataSource.body = [ res.recipe_order ];
        }
        if (res.recipe_order_stats) {
          this.setTagLine(res.recipe_order_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`);
          }));
        }
      },
      err => this.singleDataSource.body = []
    );
  }

  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ recipe_order_id: params['id'] })
      )
    );
  }
  /**
   * 5. Implement methods to handle user actions
   */

  public openListRow(row: any): void {
    this.router.navigate([`/run/execution-order-fill/${row.id}`]);
  }

}
