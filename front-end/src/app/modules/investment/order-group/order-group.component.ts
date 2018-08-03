import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, map } from 'rxjs/operators';

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
      'recipes.status.41' : StatusClass.PENDING,
      'recipes.status.42': StatusClass.REJECTED,
      'recipes.status.43': StatusClass.APPROVED,
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
      show: (row) => !row.approval_user, // change to check by status
      execConfirm: (row) => this.showRationaleModal(row, data => data && this.alterGroup(data, 83)),
      execDecline: (row) => this.showRationaleModal(row, data => data && this.alterGroup(data, 82)),
    }}),
  ];

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'text', sortable: true }},
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
  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.ordersService.getAllOrdersByGroupId(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        Object.assign(this.listDataSource, {
          body: res.recipe_orders,
          footer: res.footer
        });
        this.count = res.count;
      },
      err => this.listDataSource.body = []
    )
  }

  protected getSingleData(): void {
    // mock
    this.singleDataSource.body = [{
      "id": 1,
      "created_timestamp": 15683498502378,
      "status": 51,
      "approval_user": "test user",
      "approval_comment": "test approval comment"
    }];

    // this.route.params.pipe(
    //   mergeMap(
    //     params => this.ordersService.getOrderGroupOfRecipe(params['id'])
    //   )
    // ).subscribe(
    //   res => {
    //     if(res.recipe_order_group) {
    //       this.singleDataSource.body = [res.recipe_order_group];
    //       this.showGenerateOrders = false; // hide Generate orders button
    //     }

    //     if(res.recipe_stats) {
    //       this.setTagLine(res.recipe_stats.map(stat => {
    //         return new TagLineItem(`${stat.count} ${stat.name}`)
    //       }))
    //     }
    //   },
    //   err => this.singleDataSource.body = []
    // );
  }

  protected getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ recipe_order_id: params['id'] })
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
    console.log('generateOrders');
    this.route.params.pipe(
      mergeMap(
        params => this.ordersService.generateOrders(params['id'])
      )
    ).subscribe(
      res => {
        // todo
      },
      err => this.singleDataSource.body = []
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
        this.getAllData();
        this.getTimelineData();
      }
    );
  }

}
