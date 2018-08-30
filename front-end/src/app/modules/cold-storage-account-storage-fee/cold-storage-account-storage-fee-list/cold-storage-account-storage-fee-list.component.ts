import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DateCellDataColumn, NumberCellDataColumn, StatusCellDataColumn } from '../../../shared/components/data-table-cells';
import { ActivatedRoute, Router } from '@angular/router';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cold-storage-account-storage-fee-list',
  templateUrl: './cold-storage-account-storage-fee-list.component.html',
  styleUrls: ['./cold-storage-account-storage-fee-list.component.scss']
})
export class ColdStorageAccountStorageFeeListComponent extends DataTableCommonManagerComponent implements OnInit {

  public storageFeeDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'creation_timestamp', nameKey: 'table.header.creation_date', filter: { type: 'date', sortable: true } },
      { column: 'amount', nameKey: 'table.header.amount', filter: { type: 'number', sortable: true } },
      { column: 'asset', nameKey: 'table.header.asset', filter: { type: 'text', sortable: true } },
      { column: 'cold_storage_account_id', nameKey: 'table.header.cold_storage_account_id', filter: { type: 'text', sortable: true } },
      { column: 'custodian', nameKey: 'table.header.custodian', filter: { type: 'text', sortable: true } },
      { column: 'strategy_type', nameKey: 'table.header.portfolio', filter: { type: 'text', sortable: true } },
    ],
    body: null
  };

  public storageFeeColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'creation_timestamp' }),
    new NumberCellDataColumn({ column: 'amount' }),
    new TableDataColumn({ column: 'asset' }),
    new TableDataColumn({ column: 'cold_storage_account_id'}),
    new TableDataColumn({ column: 'custodian' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private coldStorageService: ColdStorageService,
  ) { 
    super (route,router)
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getAllData(): void {
    this.coldStorageService.getAllStorageFees(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.storageFeeDataSource, {
          body: res.fees,
          footer: res.footer
        });
        this.count = res.count;
      }
    )
  }

  getFilterLOV(): void {
    this.storageFeeDataSource.header.filter(
      col => ['asset', 'cold_storage_account_id', 'custodian', 'portfolio'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.coldStorageService.getAllStorageFeesHeaderLOV(col.column);
      }
    )
  }


}
