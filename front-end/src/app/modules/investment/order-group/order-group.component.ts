import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators/mergeMap';
import 'rxjs/add/operator/finally';
import _ from 'lodash';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import {
  ActionCellDataColumn,
  DataCellAction,
  DateCellDataColumn,
  StatusCellDataColumn,
  NumberCellDataColumn,
  ConfirmCellDataColumn,
} from '../../../shared/components/data-table-cells';

import { InvestmentService } from '../../../services/investment/investment.service';
import { OrdersService } from '../../../services/orders/orders.service';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-order-group',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class OrderGroupComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe orders';
  public singleTitle: string = 'Orders';
  public listTitle: string = '';
  public singleTableEmptyText: string = 'orders.orders_not_generated';
  public listTableEmptyText: string = 'orders.orders_not_generated';
  public showGenerateOrders = true;

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'created_timestamp', nameKey: 'table.header.creation_time' },
      { column: 'status', nameKey: 'table.header.status' },
      { column: 'approval_user', nameKey: 'table.header.decision_by' },
      { column: 'approval_comment', nameKey: 'table.header.rationale' },
      { column: 'actions', nameKey: 'table.header.actions' },
    ],
    body: null
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'created_timestamp' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'orders_group.status.81' : StatusClass.PENDING,
      'orders_group.status.82': StatusClass.REJECTED,
      'orders_group.status.83': StatusClass.APPROVED,
    }}}),
    new TableDataColumn({ column: 'approval_user' }),
    new ActionCellDataColumn({ column: 'approval_comment', inputs: {
        actions: [
          new DataCellAction({
            label: 'READ',
            exec: (row: any) => {
              this.showReadModal({
                title: 'Rationale',
                content: row.approval_comment
              })
            }
          })
        ]
      }
    }),
    new ConfirmCellDataColumn({ column: 'actions', inputs: {
      show: (row) => row.status == 'orders_group.status.81',
      execConfirm: (row) => this.showRationaleModal(row, data => data && this.alterGroup(data, 83)),
      execDecline: (row) => this.showRationaleModal(row, data => data && this.alterGroup(data, 82)),
    }}),
  ];

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true }},
      { column: 'instrument', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true }},
      { column: 'side', nameKey: 'table.header.side', filter: { type: 'text', sortable: true }},
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true }},
      { column: 'price', nameKey: 'table.header.price', filter: { type: 'number', sortable: true }},
      { column: 'quantity', nameKey: 'table.header.total_quantity', filter: { type: 'number', sortable: true }},
      { column: 'sum_of_exchange_trading_fee', nameKey: 'table.header.sum_of_exchange_trading_fee', filter: { type: 'number', sortable: true }},
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true }}
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new TableDataColumn({ column: 'exchange' }),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
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

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private investmentService: InvestmentService,
    private ordersService: OrdersService,
  ) {
    super(route);

    this.getFilterLOV();
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */
  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * 4. Implement abstract methods to fetch data OnInit
   */
  protected getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.ordersService.getOrderGroupOfRecipe(params['id'], true)
          .finally(() => {
            this.getAllData_call = this.getAllDataReal;
            this.getAllData();
            
            // stop loading and show empty
            if(!this.singleDataSource.body)
              this.singleDataSource.body = [];
          })
      ),
    ).subscribe(
      res => {
        if(res.recipe_order_group) {
          this.singleDataSource.body = [res.recipe_order_group];

          if(res.recipe_order_group.status == 'orders_group.status.82') { // if rejected
            this.showGenerateOrders = true;
          } else {
            this.showGenerateOrders = false;
          }
          this.disableGenerateOrders = false;
        }
      },
      err => this.singleDataSource.body = []
    );
  }

  // empty on start, after we load first table, we can load this one
  private getAllData_call = () => {};
  public getAllData(): void {
    this.getAllData_call();
  }

  public getAllDataReal(): void {
    let orderGroupId = _.isEmpty(this.singleDataSource.body) ? 0 : this.singleDataSource.body[0]['id'];

    this.ordersService.getAllOrdersByGroupId(orderGroupId, this.requestData).subscribe(
      res => {
        Object.assign(this.listDataSource, {
          body: res.recipe_orders,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      },
      err => this.listDataSource.body = []
    )
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id', 'instrument', 'side', 'exchange', 'status'].includes(col.column)
    ).map(
      col => {
        let filter = { filter : { recipe_order_group_id: this.routeParamId }};
        col.filter.rowData$ = this.investmentService.getAllOrdersHeaderLOV(col.column, filter);
      }
    );
  }

  protected getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ recipe_run_id: params['id'] })
      )
    );
  }

  /**
   * 5. Implement abstract methods to handle user actions
   */

  public openSingleRow(row: any): void {
    //this.router.navigate([`/run/recipe/${row.id}`]);
  }

  public openListRow(row: any): void {
    this.router.navigate([`/run/execution-order/${row.id}`]);
  }

  public generateOrders() {
    this.disableGenerateOrders = true;

    this.route.params.pipe(
      mergeMap(
        params => this.ordersService.generateOrders(params['id'])
      )
    ).subscribe(
      res => {
        // update tables information
        this.getSingleData();
        this.getTimelineData();
      }
    );
  }

  // approve or reject order group (depends on status)
  private alterGroup(data, status) {
    const requestData = {
      status: status,
      comment: data.rationale
    };

    this.ordersService.alterOrderGroup(data.data.id, requestData).subscribe(
      res => {
        // update tables information
        this.getSingleData();
        this.getTimelineData();
      }
    );
  }

}
