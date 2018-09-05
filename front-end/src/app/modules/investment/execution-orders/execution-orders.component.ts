import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, finalize } from 'rxjs/operators';

import { TimelineDetailComponent, ITimelineDetailComponent } from '../timeline-detail/timeline-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusCellDataColumn, NumberCellDataColumn, DateCellDataColumn } from '../../../shared/components/data-table-cells';
import { StatusClass } from '../../../shared/models/common';

@Component({
  selector: 'app-execution-orders',
  templateUrl: './../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class ExecutionOrdersComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {

    /**
   * 1. Implement attributes to display titles
   */
  public pageTitle = 'Execution orders';
  public singleTitle = '';
  public listTitle = '';

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource;
  public singleColumnsToShow;


  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'instrument', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true } },
      { column: 'side', nameKey: 'table.header.side', filter: { type: 'text', sortable: true, inputSearch: false } },
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true }},
      { column: 'type', nameKey: 'table.header.type', filter: { type: 'text', sortable: true, inputSearch: false } },
      { column: 'price', nameKey: 'table.header.price', filter: { type: 'number', sortable: true } },
      { column: 'total_quantity', nameKey: 'table.header.total_quantity', filter: { type: 'number', sortable: true } },
      { column: 'exchange_trading_fee', nameKey: 'table.header.exchange_trading_fee', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true, inputSearch: false } },
      { column: 'submission_time', nameKey: 'table.header.submission_time', filter: { type: 'date', sortable: true } },
      { column: 'completion_time', nameKey: 'table.header.completion_time', filter: { type: 'date', sortable: true } }
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new TableDataColumn({column: 'exchange'}),
    new StatusCellDataColumn({ column: 'type', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new NumberCellDataColumn({ column: 'price', inputs: {
      digitsInfo: '1.2-5'
    } }),
    new NumberCellDataColumn({ column: 'total_quantity' }),
    new NumberCellDataColumn({ column: 'exchange_trading_fee', inputs: {
      digitsInfo: '1.2-10'
    } }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'execution_orders.status.61': StatusClass.PENDING,
      'execution_orders.status.62': StatusClass.APPROVED,
      'execution_orders.status.63': StatusClass.APPROVED,
      'execution_orders.status.64': StatusClass.APPROVED,
      'execution_orders.status.65': StatusClass.REJECTED,
      'execution_orders.status.66': StatusClass.FAILED,
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
   * 4. Implement methods to fetch data OnInit
   */
  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllExecOrders(params['id'], this.requestData).pipe(
          finalize(() => this.stopTableLoading())
        )
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.execution_orders;
        this.listDataSource.footer = res.footer;
        this.count = res.count;
        this.getFilterLOV();
      },
      err => this.listDataSource.body = []
    );
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id', 'instrument', 'side', 'exchange', 'type', 'status'].includes(col.column)
    ).map(
      col => {
        const filter = {filter : {investment_run_id: this.routeParamId}};
        col.filter.rowData$ = this.investmentService.getAllExecutionOrdersHeaderLOV(col.column, filter);
      }
    );
  }

  public getSingleData(): void {}

  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
         params => this.investmentService.getAllTimelineData({ investment_run_id: params['id'] })
      )
    );
  }

  /**
   * 5. Implement abstract methods to handle user actions
   */

  public openListRow(row: any): void {
    this.router.navigate([`/run/execution-order-fill/${row.id}`]);
  }


}
