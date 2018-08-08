import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params, NavigationStart } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn, ConfirmCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { mergeMap, map } from 'rxjs/operators';
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
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'instrument', nameKey: 'table.header.instrument' },
      { column: 'side', nameKey: 'table.header.side' },
      { column: 'exchange', nameKey: 'table.header.exchange'},
      { column: 'type', nameKey: 'table.header.type' },
      { column: 'price', nameKey: 'table.header.price' },
      { column: 'quantity', nameKey: 'table.header.total_quantity' },
      { column: 'fee', nameKey: 'table.header.exchange_trading_fee' },
      { column: 'status', nameKey: 'table.header.status' },
      { column: 'submission_time', nameKey: 'table.header.submission_time' },
      { column: 'completion_time', nameKey: 'table.header.completion_time' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: {type: 'text', sortable: true }},
      { column: 'fill_time', nameKey: 'table.header.fill_time', filter: {type: 'date', sortable: true }},
      { column: 'fill_price', nameKey: 'table.header.fill_price', filter: {type: 'number', sortable: true }},
      { column: 'quantity', nameKey: 'table.header.quantity', filter: {type: 'number', sortable: true }}
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
    new NumberCellDataColumn({ column: 'exchange_trading_fee' }),
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

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
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

    this.getFilterLOV();
  }

  /**
   * 4. Implement abstract methods to fetch data OnInit
   */
  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllExecOrdersFills(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.count = res.count;
        this.listDataSource.body = res.execution_order_fills;
        this.listDataSource.footer = res.footer;
        this.getFilterLOV();
      },
      err => this.listDataSource.body = []
    )
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id'].includes(col.column)
    ).map(
      col => {
        let filter = {"filter" : {"execution_order_id": this.routeParamId}}
        col.filter.rowData$ = this.investmentService.getAllExecutionOrdersFillsHeaderLOV(col.column, filter);
      }
    );
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
        if(res.execution_order_stats) {
          this.setTagLine(res.execution_order_stats.map(stat => {
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
         params => this.investmentService.getAllTimelineData({ "execution_order_id": params['id'] })
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
    //this.router.navigate([`/run/execution-order-fill/${row.id}`])
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }

}
