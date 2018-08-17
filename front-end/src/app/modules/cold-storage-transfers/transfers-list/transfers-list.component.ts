import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { ActivatedRoute, Router } from "@angular/router";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { NumberCellDataColumn, StatusCellDataColumn, DateCellDataColumn, ActionCellDataColumn, DataCellAction } from "../../../shared/components/data-table-cells/index";
import { StatusClass } from "../../../shared/models/common";
import { ColdStorageService } from "../../../services/cold-storage/cold-storage.service";
import { Transfer } from "../../../shared/models/transfer";

@Component({
  selector: 'app-transfers-list',
  templateUrl: './transfers-list.component.html',
  styleUrls: ['./transfers-list.component.scss']
})
export class TransfersListComponent extends DataTableCommonManagerComponent implements OnInit {

  modalShow = false;
  selectedTransfer: Transfer;

  public transfersDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'asset', nameKey: 'table.header.asset', filter: { type: 'text', sortable: true } },
      { column: 'gross_amount', nameKey: 'table.header.gross_amount', filter: { type: 'number', sortable: true } },
      { column: 'net_amount', nameKey: 'table.header.net_amount', filter: { type: 'number', sortable: true } },
      { column: 'exchange_withdrawal_fee', nameKey: 'table.header.exchange_withdrawal_fee', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
      { column: 'cold_storage_account_id', nameKey: 'table.header.destination_account', filter: { type: 'text', sortable: true } },
      { column: 'custodian', nameKey: 'table.header.custodian', filter: { type: 'text', sortable: true } },
      { column: 'strategy_type', nameKey: 'table.header.portfolio', filter: { type: 'text', sortable: true } },
      { column: 'source_exchange', nameKey: 'table.header.source_exchange', filter: { type: 'text', sortable: true } },
      { column: 'source_account', nameKey: 'table.header.source_account', filter: { type: 'text', sortable: true } },
      { column: 'placed_timestamp', nameKey: 'table.header.placed_time', filter: { type: 'date', sortable: true } },
      { column: 'completed_timestamp', nameKey: 'table.header.completion_time', filter: { type: 'date', sortable: true } },
      { column: 'actions', nameKey: 'table.header.actions' },
    ],
    body: null
  };

  public transfersColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'asset' }),
    new NumberCellDataColumn({ column: 'gross_amount' }),
    new NumberCellDataColumn({ column: 'net_amount' }),
    new NumberCellDataColumn({ column: 'exchange_withdrawal_fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'cold_storage_transfers.status.91': StatusClass.PENDING,
      'cold_storage_transfers.status.92': StatusClass.APPROVED,
      'cold_storage_transfers.status.93': StatusClass.PENDING,
      'cold_storage_transfers.status.94': StatusClass.APPROVED,
      'cold_storage_transfers.status.95': StatusClass.FAILED,
    }} }),
    new TableDataColumn({ column: 'cold_storage_account_id' }),
    new TableDataColumn({ column: 'custodian' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
    new TableDataColumn({ column: 'source_exchange' }),
    new TableDataColumn({ column: 'source_account' }),
    new DateCellDataColumn({ column: 'placed_timestamp' }),
    new DateCellDataColumn({ column: 'completed_timestamp' }),
    new ActionCellDataColumn({ column: 'actions', inputs: {
      actions: [
        new DataCellAction({
          label: '',
          isShown: row => row.status === 'cold_storage_transfers.status.91',
          exec: (row: any) => {
            this.modalShow= true;
            this.selectedTransfer = row;
          }
        })
      ]
    }}),
  ];

  constructor(
      private coldStorageService: ColdStorageService,
      public route: ActivatedRoute,
      private router: Router) {
    super(route);
   }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getAllData(): void {
    this.coldStorageService.getAllTransfers(this.requestData).subscribe(
      res => {
        Object.assign(this.transfersDataSource, {
          body: res.transfers,
          footer: res.footer
        });
        this.count = res.count;
      }
    )
  }

  getFilterLOV(): void {
    this.transfersDataSource.header.filter(
      col => ['asset', 'status', 'source_account', 'source_exchange', 'portfolio', 'custodian','destination_account' ].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.coldStorageService.getAllTransfersHeaderLOV(col.column);
      }
    )
  }

  Confirm(){
    this.coldStorageService.ConfirmTransfer(this.selectedTransfer).subscribe(
      res => {
        if (res.success){
          this.getAllData;
        }
      }, error => {
          console.log('Error', error);
        }
    )
    this.modalShow = false;
  }

  hideConfirm(){
    this.modalShow=false;
  }

  openRow(transfer: Transfer): void {
    this.router.navigate(['/assets/view/', transfer.asset_id]);
  }

}
