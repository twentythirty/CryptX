import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mergeMap, finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { StatusClass } from '../../../shared/models/common';
import permissions from '../../../config/permissions';

import {
  TimelineDetailComponent,
  SingleTableDataSource,
  ITimelineDetailComponent
} from '../timeline-detail/timeline-detail.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import {
  StatusCellDataColumn,
  DataCellAction,
  ActionCellDataColumn,
  NumberCellDataColumn
} from '../../../shared/components/data-table-cells';
import { DepositApproveComponent } from '../../deposit/deposit-approve/deposit-approve.component';

import { InvestmentService, AssetConversionStatus } from '../../../services/investment/investment.service';
import { AuthService } from '../../../services/auth/auth.service';


@Component({
  selector: 'app-deposit-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class DepositDetailComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {
  /**
   * 1. Implement attributes to display titles
   */
  public pageTitle = 'Recipe run';
  public singleTitle = 'Currency conversion';
  public listTitle = 'Deposits';

  showConversionAmountModal: boolean = false;
  conversionAmountFormLoading: boolean = false;
  conversionAmountModalError: string;
  conversionAmountForm = new FormGroup({
    amount: new FormControl('', Validators.required)
  });
  updateConversionAmount: Function;
  completeConversionLoading = false;
  calculateDepositsLoading = false;

  depositApproveId: number;

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'investment_currency', nameKey: 'table.header.investment_currency' },
      { column: 'investment_amount', nameKey: 'table.header.investment_amount' },
      { column: 'target_currency', nameKey: 'table.header.target_currency' },
      { column: 'converted_amount', nameKey: 'table.header.converted_amount' },
      { column: 'status', nameKey: 'table.header.status' },
    ],
    body: null
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'investment_currency' }),
    new NumberCellDataColumn({ column: 'investment_amount' }),
    new TableDataColumn({ column: 'target_currency' }),
    new NumberCellDataColumn({ column: 'converted_amount' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      [AssetConversionStatus.Pending]: StatusClass.PENDING,
      [AssetConversionStatus.Completed]: StatusClass.APPROVED,
    }}}),
  ];


  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true }},
      { column: 'quote_asset', nameKey: 'table.header.deposit_currency', filter: { type: 'text', sortable: true }},
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true }},
      { column: 'account', nameKey: 'table.header.account', filter: { type: 'text', sortable: true }, column_class: 'column-source-account' },
      { column: 'amount', nameKey: 'table.header.deposit_amount', filter: { type: 'number', sortable: true }},
      { column: 'deposit_management_fee', nameKey: 'table.header.deposit_management_fee', filter: { type: 'number', sortable: true }},
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true, inputSearch: false } },
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({ column: 'account' }),
    new TableDataColumn({ column: 'amount' }),
    new NumberCellDataColumn({ column: 'deposit_management_fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'deposits.status.150': StatusClass.PENDING,
      'deposits.status.151': StatusClass.APPROVED,
    }}}),
  ];

  @ViewChild(DepositApproveComponent) depositApproveComponent: DepositApproveComponent;

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private investmentService: InvestmentService,
  ) {
    super(route, router);
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }


  /**
   * 4. Implement methods to fetch data OnInit
   */
  public getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllConversions(params['id'])
      )
    ).subscribe(
      res => {
        Object.assign(this.singleDataSource, {
          body: res.conversions,
          footer: res.footer
        });

        if (this.authService.hasPermissions([permissions.ALTER_ASSET_CONVERSIONS])) {
          this.appendActionColumnForConversions();
        }
      },
      err => this.singleDataSource.body = []
    );
  }

  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllRecipeDeposits(params['id'], this.requestData).pipe(
          finalize(() => this.stopTableLoading())
        )
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.recipe_deposits;
        this.listDataSource.footer = res.footer;
        this.count = res.count;
        this.getFilterLOV();

        if (this.authService.hasPermissions([permissions.APPROVE_DEPOSITS])) {
          this.appendActionColumnForDeposits();
        }
      },
      err => this.listDataSource.body = []
    );
  }

  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ recipe_run_id: params['id'] })
      )
    );
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id', 'quote_asset', 'exchange', 'status'].includes(col.column)
    ).map(
      col => {
        const filter = { filter : { recipe_run_id: this.routeParamId }};
        col.filter.rowData$ = this.investmentService.getAllDepositDetailsHeaderLOV(col.column, filter);
      }
    );
  }

  /**
   * 5. Implement methods to handle user actions
   */

  public openListRow(row: any): void {
    this.router.navigate(['/deposits/view', row.id]);
  }


  private appendActionColumnForConversions(): void {
    _.remove(this.singleDataSource.header, ['column', 'action']);
    _.remove(this.singleColumnsToShow, ['column', 'action']);

    if (this.singleDataSource.body.some(row => row.status !== AssetConversionStatus.Completed)) {
      this.singleDataSource.header.push({ column: 'action', nameKey: 'table.header.actions' });
      this.singleColumnsToShow.push(
        new ActionCellDataColumn({
          column: 'action',
          inputs: {
            actions: [
              new DataCellAction({
                label: '',
                className: 'ico-pencil',
                isShown: (row: any) => row.status !== AssetConversionStatus.Completed,
                exec: (row: any) => this.openConversionAmountModal(row)
              }),
              new DataCellAction({
                label: '',
                loading: () => this.completeConversionLoading,
                className: 'highlighted ico-check-mark',
                isShown: (row: any) => row.status !== AssetConversionStatus.Completed && row.converted_amount !== null,
                exec: (row: any) => this.completeConversion(row)
              }),
            ]
          }
        })
      );
    }
  }

  completeConversion(row: any) {
    this.completeConversionLoading = true;

    this.investmentService.completeAssetConversion(row.id, +row.converted_amount).pipe(
      finalize(() => this.completeConversionLoading = false)
    )
    .subscribe(
      res => {
        Object.assign(row, res.conversion);
      }
    );
  }

  openConversionAmountModal(row: any) {
    this.showConversionAmountModal = true;
    this.conversionAmountForm.controls.amount.setValue(row.converted_amount);
    this.updateConversionAmount = this.updateConversionAmount_attr.bind(this, row);
  }

  private updateConversionAmount_attr(row) {
    const amount = +this.conversionAmountForm.controls.amount.value;

    this.conversionAmountFormLoading = true;

    this.investmentService.submitAssetConversion(row.id, amount).pipe(
      finalize(() => this.conversionAmountFormLoading = false)
    )
    .subscribe(
      res => {
        if (res.success) {
          Object.assign(row, res.conversion);
          this.closeConversionAmountModal();
        } else {
          this.conversionAmountModalError = res.error;
        }
      }
    );
  }

  closeConversionAmountModal() {
    this.showConversionAmountModal = false;
    this.conversionAmountForm.reset();
  }

  showCalculateDeposits(): boolean {
    // if dont have permissions
    if (!this.authService.hasPermissions([permissions.ALTER_ASSET_CONVERSIONS])) {
      return false;
    }

    // if already calculated
    if (this.listDataSource.body && this.listDataSource.body.length > 0) {
      return false;
    }

    // if all conversions are completed
    return this.singleDataSource.body && this.singleDataSource.body.every(item => item.status === AssetConversionStatus.Completed);
  }

  calculateDeposits() {
    this.calculateDepositsLoading = true;

    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.calculateDeposits(params.id).pipe(
          finalize(() => this.calculateDepositsLoading = false)
        )
      )
    ).subscribe(
      res => {
        this.getAllData();
        this.getTimelineData();
      }
    );
  }


  private appendActionColumnForDeposits(): void {
    _.remove(this.listDataSource.header, ['column', 'action']);
    _.remove(this.listColumnsToShow, ['column', 'action']);

    if (this.listDataSource.body.some(row => row.status !== 'deposits.status.151')) {
      this.listDataSource.header.push({ column: 'action', nameKey: 'table.header.action' });
      this.listColumnsToShow.push(
        new ActionCellDataColumn({
          column: 'action',
          inputs: {
            actions: [
              new DataCellAction({
                label: '',
                className: 'ico-pencil',
                isShown: (row: any) => row.status !== 'deposits.status.151',
                exec: (row: any) => {
                  this.depositApproveId = row.id;
                  this.depositApproveComponent.openModal();
                }
              }),
            ]
          }
        })
      );
    }
  }

  depositApproveUpdateData() {
    this.getAllData();
    this.getTimelineData();
  }

}
