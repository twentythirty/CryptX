import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { finalize } from 'rxjs/operators';

import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { DateCellDataColumn, StatusCellDataColumn, NumberCellDataColumn } from "../../../shared/components/data-table-cells";
import { ExecutionOrdersService } from "../../../services/execution-orders/execution-orders.service";
import { StatusClass } from "../../../shared/models/common";
import { Order } from "../../../shared/models/order";

@Component({
  selector: 'app-execution-order-list',
  templateUrl: './execution-order-list.component.html',
  styleUrls: ['./execution-order-list.component.scss']
})
export class ExecutionOrderListComponent extends DataTableCommonManagerComponent implements OnInit {

   public orderDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: {  type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'investment_run_id', nameKey: 'table.header.investment_run_id', filter: { type: 'text', sortable: true } },
      { column: 'instrument', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true } },
      { column: 'side', nameKey: 'table.header.side', filter: { type: 'text', sortable: true } },
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'type', nameKey: 'table.header.type', filter: { type: 'text', sortable: true } },
      { column: 'price', nameKey: 'table.header.price', filter: { type: 'number', sortable: true } },
      { column: 'total_quantity', nameKey: 'table.header.total_quantity', filter: { type: 'number', sortable: true } },
      { column: 'exchange_trading_fee', nameKey: 'table.header.exchange_trading_fee', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
      { column: 'submission_time', nameKey: 'table.header.submission_time', filter: { type: 'date', sortable: true } },
      { column: 'completion_time', nameKey: 'table.header.completion_time', filter: { type: 'date', sortable: true }},
    ],
    body: null
  };

  public orderColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'investment_run_id' }),
    new TableDataColumn({ column: 'instrument' }),
    new StatusCellDataColumn({ column: 'side' }),
    new TableDataColumn({ column: 'exchange' }),
    new StatusCellDataColumn({ column: 'type' }),
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
    new DateCellDataColumn({ column: 'submission_time'}),
    new DateCellDataColumn({ column: 'completion_time'}),
  ];

  constructor(
    public route: ActivatedRoute,
    protected orderService: ExecutionOrdersService,
    public router: Router,
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getFilterLOV(): void {
    this.orderDataSource.header.filter(
      col => ['id', 'investment_run_id', 'instrument', 'side', 'exchange', 'type', 'status'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.orderService.getHeaderLOV(col.column)
      }
    );
  }

  getAllData(): void {
    this.orderService.getAllExecutionOrders(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.orderDataSource, {
          body: res.execution_orders,
          footer: res.footer
        });
        this.count = res.count;
      }
    )
  }

  openRow(order: Order): void {
    this.router.navigate(['/run/execution-order-fill/', order.id]);
  }

}
