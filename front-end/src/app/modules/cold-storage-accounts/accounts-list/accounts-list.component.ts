import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { Router, ActivatedRoute } from "@angular/router";
import { ColdStorageService } from "../../../services/cold-storage/cold-storage.service";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { StatusCellDataColumn, NumberCellDataColumn, DateCellDataColumn, CurrencyCellDataColumn } from "../../../shared/components/data-table-cells/index";

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent extends DataTableCommonManagerComponent implements OnInit {

  public accountsDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'asset', nameKey: 'table.header.asset', filter: { type: 'text', sortable: true } },
      { column: 'strategy_type', nameKey: 'table.header.portfolio', filter: { type: 'text', sortable: true } },
      { column: 'address', nameKey: 'table.header.address', filter: { type: 'text', sortable: true } },
      { column: 'custodian', nameKey: 'table.header.custodian', filter: { type: 'text', sortable: true } },
      { column: 'balance', nameKey: 'table.header.balance', filter: { type: 'number', sortable: true } },
      { column: 'balance_usd', nameKey: 'table.header.balance_usd', filter: { type: 'number', sortable: true } },
      { column: 'balance_update_timestamp', nameKey: 'table.header.balance_updated', filter: { type: 'date', sortable: true } },
    ],
    body: null
  };

  public accountsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'asset' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
    new TableDataColumn({ column: 'address' }),
    new TableDataColumn({ column: 'custodian' }),
    new NumberCellDataColumn({ column: 'balance' }),
    new CurrencyCellDataColumn ({ column: 'balance_usd' }),
    new DateCellDataColumn({ column: 'balance_update_timestamp' }),
  ];

  constructor(
      private coldStorageService: ColdStorageService,
      public route: ActivatedRoute,
      public router: Router,
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getAllData(): void {
    this.coldStorageService.getAllAccounts(this.requestData)
    .finally(() => this.stopTableLoading())
    .subscribe(
      res => {
        Object.assign(this.accountsDataSource, {
          body: res.accounts,
          footer: res.footer
        });
        this.count = res.count;
      }
    )
  }

  getFilterLOV(): void {
    this.accountsDataSource.header.filter(
      col => ['asset', 'strategy_type', 'address', 'custodian'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.coldStorageService.getAllAccountsHeaderLOV(col.column);
      }
    )
  }

  addAccount(){
    this.router.navigate(['/cold_storage/accounts/add']);
  }

}
