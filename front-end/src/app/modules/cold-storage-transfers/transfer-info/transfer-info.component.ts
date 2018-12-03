import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, filter, tap } from 'rxjs/operators';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import {
  NumberCellDataColumn,
  StatusCellDataColumn,
  DateCellDataColumn,
  ActionCellDataColumn,
  DataCellAction
} from '../../../shared/components/data-table-cells/index';
import { StatusClass } from '../../../shared/models/common';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { Transfer } from '../../../shared/models/transfer';
import { ActionLog } from '../../../shared/models/actionLog';

@Component({
  selector: 'app-transfer-info',
  templateUrl: './transfer-info.component.html',
  styleUrls: ['./transfer-info.component.scss']
})
export class TransferInfoComponent extends DataTableCommonManagerComponent implements OnInit {

  modalShow = false;
  selectedTransfer: Transfer;

  public logsSource: Array<ActionLog>;

  public transferDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'asset', nameKey: 'table.header.asset' },
      { column: 'gross_amount', nameKey: 'table.header.gross_amount' },
      { column: 'net_amount', nameKey: 'table.header.net_amount' },
      { column: 'exchange_withdrawal_fee', nameKey: 'table.header.exchange_withdrawal_fee' },
      { column: 'status', nameKey: 'table.header.status' },
      { column: 'destination_account', nameKey: 'table.header.destination_account', column_class: 'column-source-account' },
      { column: 'custodian', nameKey: 'table.header.custodian' },
      { column: 'strategy_type', nameKey: 'table.header.portfolio' },
      { column: 'source_exchange', nameKey: 'table.header.source_exchange' },
      // { column: 'source_account', nameKey: 'table.header.source_account', column_class: 'column-source-account'},
      { column: 'placed_timestamp', nameKey: 'table.header.placed_time' },
      { column: 'completed_timestamp', nameKey: 'table.header.completion_time' },
      { column: 'actions', nameKey: 'table.header.actions' },
    ],
    body: null
  };

  public transfersColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'asset' }),
    new NumberCellDataColumn({ column: 'gross_amount', inputs: {
      digitsInfo: '1.2-4'
    } }),
    new NumberCellDataColumn({ column: 'net_amount', inputs: {
      digitsInfo: '1.2-4'
    } }),
    new NumberCellDataColumn({ column: 'exchange_withdrawal_fee', inputs: {
      digitsInfo: '1.2-4'
    } }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'cold_storage_transfers.status.91': StatusClass.PENDING,
      'cold_storage_transfers.status.92': StatusClass.APPROVED,
      'cold_storage_transfers.status.93': StatusClass.PENDING,
      'cold_storage_transfers.status.94': StatusClass.APPROVED,
      'cold_storage_transfers.status.95': StatusClass.FAILED,
    }} }),
    new TableDataColumn({ column: 'destination_account' }),
    new TableDataColumn({ column: 'custodian' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
    new TableDataColumn({ column: 'source_exchange' }),
   // new TableDataColumn({ column: 'source_account' }),
    new DateCellDataColumn({ column: 'placed_timestamp' }),
    new DateCellDataColumn({ column: 'completed_timestamp' }),
    new ActionCellDataColumn({ column: 'actions', inputs: {
      actions: [
        new DataCellAction({
          label: '',
          className: 'highlighted ico-check-mark',
          isShown: row => row.status === 'cold_storage_transfers.status.91',
          exec: (row: any) => {
            this.modalShow = true;
            this.selectedTransfer = row;
          }
        })
      ]
    }}),
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private coldStorageService: ColdStorageService,
  ) {
    super(route, router);
  }

  ngOnInit() {
    this.getTransfer();
  }

  getTransfer(): void {
    this.route.params.pipe(
      filter((params: Params) => params.transferId)
    ).subscribe(
      (params: Params) => {
        this.startTableLoading();

        this.coldStorageService.getTransfer(params.transferId).pipe(
          finalize(() => this.stopTableLoading())
        ).subscribe(
          res => {
            this.transferDataSource.body = [res.transfer];
            this.logsSource = res.action_logs;
          }
        );
      }
    );
  }

  getFilterLOV(): void { }

  confirm() {
    this.startTableLoading();
    this.coldStorageService.confirmTransfer(this.selectedTransfer).subscribe(
      res => {
        if (res.success) {
          this.selectedTransfer.status = res.status;
          this.stopTableLoading();
        }
      }, error => {
        console.log('Error', error);
      }
    );
    this.modalShow = false;
  }

  hideConfirm() {
    this.modalShow = false;
  }

}
