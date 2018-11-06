import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusCellDataColumn } from '../../../shared/components/data-table-cells';
import { finalize } from 'rxjs/operators';
import { StatusClass } from '../../../shared/models/common';

@Component({
  selector: 'app-exchange-accounts-list',
  templateUrl: './exchange-accounts-list.component.html',
  styleUrls: ['./exchange-accounts-list.component.scss']
})

export class ExchangeAccountsListComponent extends DataTableCommonManagerComponent implements OnInit {

  public exchangeAccountsDataSource: TableDataSource = {
    header: [
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'asset', nameKey: 'table.header.asset', filter: { type: 'text', sortable: true } },
      { column: 'address', nameKey: 'table.header.address', filter: { type: 'text', sortable: true } },
      { column: 'is_active', nameKey: 'table.header.status', filter: { type: 'text', sortable: true, inputSearch: true } },
    ],
    body: null
  };

  public exchangeAccountsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({column: 'asset'}),
    new TableDataColumn({column: 'address'}),
    new StatusCellDataColumn({ column: 'is_active', inputs: { classMap: {
      'exchange_accounts.is_active.inactive': StatusClass.PENDING,
      'exchange_accounts.is_active.active': StatusClass.APPROVED,
    }} }),
  ];

  constructor(
    public route: ActivatedRoute,
    protected exchangesService: ExchangesService,
    public router: Router,
  ) { super(route, router); }

  ngOnInit() {
    super.ngOnInit();
  }

  getAllData(): void {
    this.exchangesService.getAllExchangeAccounts(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.exchangeAccountsDataSource, {
          body: res.exchange_accounts,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      }
    );
  }

  getFilterLOV(): void {
    this.exchangeAccountsDataSource.header.filter(
      col => ['exchange', 'address', 'is_active'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.exchangesService.getHeaderLOV(col.column);
      }
    );
  }

  openRow(exchangeAccount): void {
    this.router.navigate(['/exchange_accounts/view/', exchangeAccount.id]);
  }

}
