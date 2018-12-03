import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { mergeMap, finalize } from 'rxjs/operators';

import {
  TimelineDetailComponent,
  SingleTableDataSource,
  TagLineItem,
  ITimelineDetailComponent
} from '../timeline-detail/timeline-detail.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import {
  ActionCellDataColumn,
  DataCellAction,
  DateCellDataColumn,
  StatusCellDataColumn,
  NumberCellDataColumn
} from '../../../shared/components/data-table-cells';
import { InvestmentService } from '../../../services/investment/investment.service';
import { ExecutionOrdersService } from '../../../services/execution-orders/execution-orders.service';

import { ActionLog } from '../../../shared/models/actionLog';
import { StatusClass } from '../../../shared/models/common';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-execution-order-fill-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class ExecutionOrderFillDetailComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {

  /**
   * 1. Implement attributes to display titles
   */
  public pageTitle = 'Execution order fill';
  public singleTitle = 'Execution order';
  public listTitle = 'Execution order fill';

  public logsTitle: string;
  public logsSource: Array<ActionLog>;

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'instrument', nameKey: 'table.header.instrument' },
      { column: 'side', nameKey: 'table.header.side' },
      { column: 'exchange', nameKey: 'table.header.exchange'},
      { column: 'type', nameKey: 'table.header.type' },
      { column: 'price', nameKey: 'table.header.price' },
      { column: 'quantity', nameKey: 'table.header.total_quantity' },
      { column: 'filled_quantity', nameKey: 'table.header.filled_quantity' },
      { column: 'spend_amount', nameKey: 'table.header.total_spend_amount' },
      { column: 'fee', nameKey: 'table.header.exchange_trading_fee' },
      { column: 'status', nameKey: 'table.header.status' },
      // { column: 'submission_time', nameKey: 'table.header.submission_time' },
      // { column: 'completion_time', nameKey: 'table.header.completion_time' },
      { column: 'action', nameKey: 'table.header.action' }
    ],
    body: null
  };

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true }},
      { column: 'fill_time', nameKey: 'table.header.fill_time', filter: { type: 'date', sortable: true }},
      { column: 'fill_price', nameKey: 'table.header.fill_price', filter: { type: 'number', sortable: true }},
      { column: 'quantity', nameKey: 'table.header.quantity', filter: { type: 'number', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new TableDataColumn({column: 'exchange'}),
    new StatusCellDataColumn({ column: 'type', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
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
    // new DateCellDataColumn({ column: 'completion_time' }),
    new ActionCellDataColumn({ column: 'action', inputs: {
      actions: [
        new DataCellAction({
          label: 'RETRY',
          isShown: row => row.status === 'execution_orders.status.66',
          exec: (row: any) => {
            this.changeExecutionOrderStatus(row.id, 61);
          }
        })
      ]
    }})
  ];

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'fill_time' }),
    new NumberCellDataColumn({ column: 'fill_price', inputs: {
      digitsInfo: '1.2-6'
    } }),
    new NumberCellDataColumn({ column: 'quantity' }),
  ];

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private investmentService: InvestmentService,
    private executionOrdersService: ExecutionOrdersService,
    private translate: TranslateService,
  ) {
    super(route, router);
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */
  ngOnInit() {
    super.ngOnInit();

    this.translate.get('common.activity_log').subscribe(data => {
      this.logsTitle = data;
    });
  }

  /**
   * 4. Implement methods to fetch data OnInit
   */
  public getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleExecutionOrder(params['id'])
      )
    ).subscribe(
      res => {
        if (res.execution_order) {
          this.singleDataSource.body = [ res.execution_order ];
        }

        if (res.action_logs) {
          this.logsSource = res.action_logs;
        }

        if (res.execution_order_stats) {
          this.setTagLine(res.execution_order_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`);
          }));
        }
      },
      err => this.singleDataSource.body = []
    );
  }

  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllExecOrdersFills(params['id'], this.requestData).pipe(
          finalize(() => this.stopTableLoading())
        )
      )
    ).subscribe(
      res => {
        Object.assign(this.listDataSource, {
          body: res.execution_order_fills,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      },
      err => this.listDataSource.body = []
    );
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id'].includes(col.column)
    ).map(
      col => {
        const filter = { filter : { execution_order_id: this.routeParamId }};
        col.filter.rowData$ = this.investmentService.getAllExecutionOrdersFillsHeaderLOV(col.column, filter);
      }
    );
  }

  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
         params => this.investmentService.getAllTimelineData({ execution_order_id: params['id'] })
      )
    );
  }

  /**
   * 5. Implement methods to handle user actions
   */

  private changeExecutionOrderStatus(id: number, status: number): void {
    this.executionOrdersService.changeExecutionOrderStatus(id, status)
    .subscribe(
      res => {
        Object.assign(this.singleDataSource.body[0], { status: res.status });
      },
      err => {}
    );
  }

}
