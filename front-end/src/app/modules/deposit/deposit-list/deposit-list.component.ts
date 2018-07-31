import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { StatusClass } from "../../../shared/models/common";
import { StatusCellDataColumn, PercentCellDataColumn, NumberCellDataColumn, ActionCellDataColumn, DataCellAction } from "../../../shared/components/data-table-cells/index";
import { ActivatedRoute, Router } from "@angular/router";
import { DepositService } from "../../../services/deposit/deposit.service";
import { Deposit } from "../../../shared/models/deposit";

@Component({
  selector: 'app-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.scss']
})
export class DepositListComponent extends DataTableCommonManagerComponent implements OnInit {

  public depositDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'text', sortable: true } },
      { column: 'transaction_asset_id', nameKey: 'table.header.transaction_asset_id', filter: { type: 'text', sortable: true } },
      { column: 'transaction_asset', nameKey: 'table.header.transaction_asset', filter: { type: 'text', sortable: true } },
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'account', nameKey: 'table.header.account', filter: { type: 'text', sortable: true } },
      { column: 'amount', nameKey: 'table.header.amount', filter: { type: 'number', sortable: true } },
      { column: 'investment_percentage', nameKey: 'table.header.investment_percentage', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
    ],
    body: null
  };

  public depositColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'transaction_asset_id' }),
    new TableDataColumn({ column: 'transaction_asset' }),
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({ column: 'account' }),
    new NumberCellDataColumn({ column: 'amount'}),
    new PercentCellDataColumn({ column: 'investment_percentage' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      '150' : StatusClass.PENDING,
      '151': StatusClass.APPROVED,
    }}}),
  ];

  constructor(public route: ActivatedRoute,
              protected depositService: DepositService,
              protected router: Router,) { 
    super(route);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getAllData(): void {
    this.depositService.getAllDeposits(this.requestData).subscribe(
      (res) => {
        this.depositDataSource.body = res.recipe_deposits;
        if(res.footer) {
          this.depositDataSource.footer = res.footer;
        }
        this.count = res.count || res.recipe_deposits.length;
      }
    )
  }

  getFilterLOV(): void {
    this.depositDataSource.header.filter(
      col => col.filter && (col.filter.type == 'text' || col.filter.type == 'boolean')
    ).map(
      col => {
        col.filter.rowData$ = this.depositService.getHeaderLOV(col.column)
      }
    )
  }

  public openRow(deposit: Deposit): void {
    this.router.navigate(['/deposits/view', deposit.id])
  }

}
