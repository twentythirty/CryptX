import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { NumberCellDataColumn, StatusCellDataColumn, DateCellDataColumn } from '../../../shared/components/data-table-cells';
import { StatusClass } from '../../../shared/models/common';

import { OrdersService } from '../../../services/orders/orders.service';
import { Order } from '../../../shared/models/order';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent extends DataTableCommonManagerComponent implements OnInit {
  public ordersDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'investment_id', nameKey: 'table.header.investment_run_id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'instrument', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true } },
      { column: 'side', nameKey: 'table.header.side', filter: { type: 'text', sortable: true, inputSearch: false } },
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'price', nameKey: 'table.header.price', filter: { type: 'number', sortable: true } },
      { column: 'quantity', nameKey: 'table.header.total_quantity', filter: { type: 'number', sortable: true } },
      { column: 'filled_quantity', nameKey: 'table.header.filled_order_quantity', filter: { type: 'number', sortable: true } },
      { column: 'spend_amount', nameKey: 'table.header.spend_amount', filter: { type: 'number', sortable: true }},
      { column: 'sum_of_exchange_trading_fee', nameKey: 'table.header.sum_of_exchange_trading_fee', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
      { column: 'created_timestamp', nameKey: 'table.header.created_time', filter: { type: 'date', sortable: true } },
      { column: 'completed_timestamp', nameKey: 'table.header.completed_time', filter: { type: 'date', sortable: true } },
    ],
    body: null
  };

  public ordersColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'investment_id' }),
    new TableDataColumn({ column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side' }),
    new TableDataColumn({ column: 'exchange' }),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'filled_quantity' }),
    new NumberCellDataColumn({ column: 'spend_amount'}),
    new NumberCellDataColumn({ column: 'sum_of_exchange_trading_fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'orders.status.51': StatusClass.PENDING,
      'orders.status.52': StatusClass.DEFAULT,
      'orders.status.53': StatusClass.APPROVED,
      'orders.status.54': StatusClass.REJECTED,
      'orders.status.55': StatusClass.REJECTED,
      'orders.status.56': StatusClass.FAILED,
    }} }),
    new DateCellDataColumn({ column: 'created_timestamp' }),
    new DateCellDataColumn({ column: 'completed_timestamp' }),
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private ordersService: OrdersService,
  ) {
    super(route, router);
  }

  /**
    * Add a rowData$ Observable to text and boolean column filters
    */
  private getFilterLOV(): void {
    this.ordersDataSource.header.filter(
      col => ['instrument', 'side', 'exchange', 'status'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.ordersService.getHeaderLOV(col.column);
      }
    );
  }

  getAllData(): void {
    this.ordersService.getAllOrders(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.ordersDataSource, {
          body: res.recipe_orders,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      }
    );
  }

  openRow(order: Order): void {
    this.router.navigate(['/run/execution-order', order.id]);
  }


}
