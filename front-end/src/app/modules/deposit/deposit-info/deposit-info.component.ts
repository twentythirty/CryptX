import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { DepositService, DepositResultData } from '../../../services/deposit/deposit.service';
import { InvestmentService } from '../../../services/investment/investment.service';
import {
  ActionCellDataColumn,
  DataCellAction,
  StatusCellDataColumn,
  NumberCellDataColumn
} from '../../../shared/components/data-table-cells';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusClass } from '../../../shared/models/common';
import { DepositStatus } from '../../../shared/models/deposit';
import { DepositApproveComponent } from '../deposit-approve/deposit-approve.component';


@Component({
  selector: 'app-deposit-info',
  templateUrl: './deposit-info.component.html',
  styleUrls: ['./deposit-info.component.scss']
})
export class DepositInfoComponent implements OnInit {

  public depositId: number;
  public activityLog: Array<DepositStatus>;
  public timeline$: Observable<object>;

  public depositDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'quote_asset', nameKey: 'table.header.deposit_currency' },
      { column: 'exchange', nameKey: 'table.header.exchange' },
      { column: 'account', nameKey: 'table.header.account', column_class: 'column-source-account' },
      { column: 'amount', nameKey: 'table.header.deposit_amount' },
      { column: 'deposit_management_fee', nameKey: 'table.header.deposit_management_fee' },
      { column: 'status', nameKey: 'table.header.status' },
    ],
    body: null
  };

  public depositColumnsToShow: Array<TableDataColumn> = [
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
    protected router: Router,
    protected depositService: DepositService,
    protected investmentService: InvestmentService,
  ) {}

  ngOnInit() {
    this.getDeposit();
  }

  getDeposit(): void {
    this.route.params.pipe(
      filter((params: Params) => params.depositId)
    ).subscribe(
      (params: Params) => {
        this.depositId = params.depositId;

        this.getTimelineData(this.depositId);

        this.depositService.getDeposit(this.depositId).subscribe(
          (res: DepositResultData) => {
            this.appendActionColumn();
            this.depositDataSource.body = [res.recipe_deposit];
            this.activityLog = res.action_logs;
          }
        );
      }
    );
  }

  appendActionColumn() {
    _.remove(this.depositDataSource.header, ['column', 'action']);
    _.remove(this.depositColumnsToShow, ['column', 'action']);

    if (this.depositDataSource.body && this.depositDataSource.body[0].status === 'deposits.status.150') {
      this.depositDataSource.header.push({ column: 'action', nameKey: 'table.header.action' });
      this.depositColumnsToShow.push(
        new ActionCellDataColumn({
          column: 'action',
          inputs: {
            actions: [
              new DataCellAction({
                label: '',
                className: 'highlighted ico-check-mark',
                isShown: (row: any) => true,
                exec: (row: any) => {
                  this.depositApproveComponent.openModal();
                }
              }),
            ]
          }
        })
      );
    }
  }

  private getTimelineData(id: number): void {
    this.timeline$ = this.investmentService.getAllTimelineData({ recipe_deposit_id: id });
  }

  onSetFilter(filterData): void {}

}
