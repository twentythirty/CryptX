import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from "@angular/router";
import { Observable } from "rxjs/Rx";
import _ from 'lodash';

import { FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DepositService, DepositResultData, DepositResponseData } from "../../../services/deposit/deposit.service";
import { Deposit, DepositStatus } from "../../../shared/models/deposit";
import { InvestmentService } from "../../../services/investment/investment.service";
import { TimelineEvent } from "../../../shared/components/timeline/timeline.component";
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, StatusCellDataColumn, PercentCellDataColumn, NumberCellDataColumn } from "../../../shared/components/data-table-cells/index";
import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { StatusClass } from "../../../shared/models/common";


@Component({
  selector: 'app-deposit-info',
  templateUrl: './deposit-info.component.html',
  styleUrls: ['./deposit-info.component.scss']
})
export class DepositInfoComponent extends DataTableCommonManagerComponent implements OnInit {

  public depositDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'quote_asset', nameKey: 'table.header.quote_asset' },
      { column: 'exchange', nameKey: 'table.header.exchange' },
      { column: 'account', nameKey: 'table.header.account' },
      { column: 'amount', nameKey: 'table.header.amount' },
      { column: 'investment_percentage', nameKey: 'table.header.investment_percentage' },
      { column: 'deposit_management_fee', nameKey: 'table.header.deposit_management_fee' },
      { column: 'depositor_user', nameKey: 'table.header.depositor_user' },
      { column: 'status', nameKey: 'table.header.status' },
    ],
    body: null
  };

  public depositColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({ column: 'accout' }),
    new NumberCellDataColumn({ column: 'amount' }),
    new PercentCellDataColumn({ column: 'investment_percentage' }),
    new NumberCellDataColumn({ column: 'deposit_management_fee' }),
    new TableDataColumn({ column: 'depositor_user' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'deposits.status.150' : StatusClass.PENDING,
      'deposits.status.151': StatusClass.APPROVED,
    }}}),
  ];


  public depositId: number;
  public depositStatus;
  public activityLog: Array<DepositStatus>;
  public showConfirm = false;
  public showModal = false;
  public amount = '';
  public management_fee = '';

  public timeline$: Observable<object>;

  depositForm = new FormGroup({
    Amount: new FormControl('', [Validators.required]),
    Management_fee: new FormControl('', [Validators.required]),
  });

  constructor(
    public route: ActivatedRoute,
    protected depositService: DepositService,
    protected router: Router,
    protected investmentService: InvestmentService,
  ) {
    super(route);
  }


  ngOnInit() {
    super.ngOnInit();
    this.getDeposit();
  }

  private getDeposit(): void {
    this.route.params.filter(
      (params: Params) => params.depositId
    ).subscribe(
      (params: Params) => {
        this.depositId = params.depositId;
        if (this.depositId){
          this.getTimelineData(this.depositId);
        }
        this.depositService.getDeposit(this.depositId).subscribe(
          (res: DepositResultData) => {
            this.depositDataSource.body = [res.recipe_deposit];
            this.depositStatus = [res.recipe_deposit];
            this.activityLog = res.action_logs;
            this.appendActionColumn();
          }
        )
      }
    )
  }

  appendActionColumn() {
    if (!_.find(this.depositDataSource.header, col => col.column == 'action')){
      if (this.depositStatus[0].status === 'deposits.status.150') {
        this.depositDataSource.header.push({ column: 'action', nameKey: 'table.header.action' })
        this.depositColumnsToShow.push(
          new ActionCellDataColumn({
            column: null,
            inputs: {
              actions: [
                new DataCellAction({
                  label: '',
                  isShown: (row: any) => true,
                  exec: (row: any) => {
                    this.showModal = true;
                  }
                }),
              ]
            }
          }));
      }
    }
  }

  hideConfirm() {
    this.showConfirm = false;
  }

  hideModal() {
    this.showModal = false;
  }

  Confirm() {
    let obj = {
      amount: parseFloat(this.amount),
      deposit_management_fee: parseFloat(this.management_fee)
    }
    if (this.depositForm.valid) {
      this.depositService.Submit(this.depositId, obj).subscribe(
        (res: DepositResponseData) => {
          if (res.success) {
            this.showModal = false;
            this.showConfirm = true;
          } else {
            console.log(res.deposit)
          }
        },
        error => {
          console.log('Error', error);
        }, () => {
        });
    } else {
      this.markAsTouched(this.depositForm);
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map((field) => {
      const control = group.get(field);

      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

  protected getTimelineData(id: number): void {
    this.timeline$ = this.investmentService.getAllTimelineData({ "recipe_deposit_id": id})
  }

  Send() {
    let obj = {
      amount: parseFloat(this.amount),
      deposit_management_fee: parseFloat(this.management_fee)
    }
    this.depositService.Approve(this.depositId, obj).subscribe(
      (data: DepositResponseData) => {
        if (data.success) {
          this.showConfirm = false;
          this.getDeposit();
        } else {
          console.log(data.deposit)
        }
      },
      error => {
        console.log('Error', error);
      }, () => {
      });
  }

}
