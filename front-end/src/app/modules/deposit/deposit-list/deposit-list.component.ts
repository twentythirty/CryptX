import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import {
  StatusCellDataColumn,
  NumberCellDataColumn,
  ActionCellDataColumn,
  DataCellAction
} from '../../../shared/components/data-table-cells';
import { StatusClass } from '../../../shared/models/common';
import { Deposit } from '../../../shared/models/deposit';

import { DepositService } from '../../../services/deposit/deposit.service';
import { DepositApproveComponent } from '../deposit-approve/deposit-approve.component';
import { permissions } from '../../../config/permissions';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.scss']
})
export class DepositListComponent extends DataTableCommonManagerComponent {

  depositId: number;

  public depositDataSource: TableDataSource = {
    header: [
      { column: 'investment_run_id', nameKey: 'table.header.investment_run_id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'quote_asset', nameKey: 'table.header.deposit_currency', filter: { type: 'text', sortable: true } },
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'account', nameKey: 'table.header.account', filter: { type: 'text', sortable: true }, column_class: 'column-source-account' },
      { column: 'amount', nameKey: 'table.header.deposit_amount', filter: { type: 'number', sortable: true } },
      { column: 'deposit_management_fee', nameKey: 'table.header.deposit_management_fee', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
    ],
    body: null
  };

  public depositColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'investment_run_id' }),
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({ column: 'account' }),
    new NumberCellDataColumn({ column: 'amount'}),
    new NumberCellDataColumn({ column: 'deposit_management_fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'deposits.status.150' : StatusClass.PENDING,
      'deposits.status.151': StatusClass.APPROVED,
    }}}),
  ];

  @ViewChild(DepositApproveComponent) depositApproveComponent: DepositApproveComponent;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    protected depositService: DepositService,
  ) {
    super(route, router);
  }


  getAllData(): void {
    this.depositService.getAllDeposits(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.depositDataSource, {
          body: res.recipe_deposits,
          footer: res.footer
        });
        this.count = res.count || res.recipe_deposits.length;
        this.getFilterLOV();

        if (this.authService.hasPermissions([permissions.APPROVE_DEPOSITS])) {
          this.appendActionColumnForDeposits();
        }
      }
    );
  }

  getFilterLOV(): void {
    this.depositDataSource.header.filter(
      col => ['quote_asset', 'exchange', 'status'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.depositService.getHeaderLOV(col.column);
      }
    );
  }

  openRow(deposit: Deposit): void {
    this.router.navigate(['/deposits/view', deposit.id]);
  }

  appendActionColumnForDeposits(): void {
    _.remove(this.depositDataSource.header, ['column', 'action']);
    _.remove(this.depositColumnsToShow, ['column', 'action']);

    if (this.depositDataSource.body.some(row => row.status !== 'deposits.status.151')) {
      this.depositDataSource.header.push({ column: 'action', nameKey: 'table.header.action' });
      this.depositColumnsToShow.push(
        new ActionCellDataColumn({
          column: 'action',
          inputs: {
            actions: [
              new DataCellAction({
                label: '',
                className: 'ico-pencil',
                isShown: (row: any) => true,
                exec: (row: any) => {
                  this.depositId = row.id;
                  this.depositApproveComponent.openModal();
                }
              }),
            ]
          }
        })
      );
    }
  }

}
