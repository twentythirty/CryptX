import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { StatusClass } from '../../../shared/models/common';

import {
  TimelineDetailComponent,
  SingleTableDataSource,
  ITimelineDetailComponent
} from '../timeline-detail/timeline-detail.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import {
  ActionCellDataColumn,
  DataCellAction,
  DateCellDataColumn,
  StatusCellDataColumn,
  ConfirmCellDataColumn,
  NumberCellDataColumn
} from '../../../shared/components/data-table-cells';

import { InvestmentService } from '../../../services/investment/investment.service';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { AuthService } from '../../../services/auth/auth.service';
import { permissions } from '../../../config/permissions';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-recipe-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class ColdStorageTransfersDetailComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {

  /**
   * 1. Implement attributes to display titles
   */
  public listTitle = 'Cold storage transfers';
  public recipeStatus;

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'asset', nameKey: 'table.header.asset', filter: { type: 'text', sortable: true } },
      { column: 'gross_amount', nameKey: 'table.header.gross_amount', filter: { type: 'number', sortable: true } },
      { column: 'net_amount', nameKey: 'table.header.net_amount', filter: { type: 'number', sortable: true } },
      { column: 'exchange_withdrawal_fee', nameKey: 'table.header.exchange_withdrawal_fee', filter: { type: 'number', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
      { column: 'custodian', nameKey: 'table.header.custodian', filter: { type: 'text', sortable: true } },
      { column: 'strategy_type', nameKey: 'table.header.portfolio', filter: { type: 'text', sortable: true } },
      { column: 'source_exchange', nameKey: 'table.header.source_exchange', filter: { type: 'text', sortable: true } },
      // { column: 'placed_timestamp', nameKey: 'table.header.placed_time', filter: { type: 'date', sortable: true } },
      // { column: 'completed_timestamp', nameKey: 'table.header.completion_time', filter: { type: 'date', sortable: true } },
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
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
    new TableDataColumn({ column: 'custodian' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
    new TableDataColumn({ column: 'source_exchange' }),
    // new DateCellDataColumn({ column: 'placed_timestamp' }),
    // new DateCellDataColumn({ column: 'completed_timestamp' }),
  ];

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private auth: AuthService,
    private investmentService: InvestmentService,
    private coldStorageService: ColdStorageService,
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
  getSingleData(): void {}

  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => {
          this.requestData.filter.recipe_run_id = params.id;

          return this.coldStorageService.getAllTransfers(this.requestData).pipe(
            finalize(() => this.stopTableLoading())
          );
        }
      )
    ).subscribe(
      res => {
        Object.assign(this.listDataSource, {
          body: res.transfers,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();

        if (this.auth.hasPermissions([permissions.APPROVE_COLD_STORAGE_TRANSFERS])) {
          this.appendActionColumn();
        }
      },
      err => this.listDataSource.body = []
    );
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => [
        'asset',
        'status',
        'source_account',
        'source_exchange',
        'strategy_type',
        'custodian',
        'cold_storage_account_id'
      ].includes(col.column)
    ).map(
      col => {
        const filter = { filter : { recipe_run_id: this.routeParamId }};
        col.filter.rowData$ = this.investmentService.getAllRecipeDetailsHeaderLOV(col.column, filter);
      }
    );
  }

  private appendActionColumn() {
    // if "actions" column already defined
    if (_.find(this.listDataSource.header, col => col.column === 'actions')) { return false; }

    // if no "pending" status transfers
    if (this.listDataSource.body.every(row => row.status !== 'cold_storage_transfers.status.91')) { return false; }

    this.listDataSource.header.push({ column: 'actions', nameKey: 'table.header.action' });
    this.listColumnsToShow.push(
      new ActionCellDataColumn({ column: 'actions', inputs: {
        actions: [
          new DataCellAction({
            label: '',
            className: 'highlighted ico-check-mark',
            loading: row => row && !!row.loading,
            isShown: row => row.status === 'cold_storage_transfers.status.91',
            exec: (row: any) => {
              row.loading = true;

              this.coldStorageService.confirmTransfer(row).pipe(
                finalize(() => row.loading = false)
              ).subscribe(
                res => {
                  this.listDataSource.body = res.transfers;
                  this.listDataSource.footer = res.footer;
                  this.count = res.count;
                }
              );
            }
          })
        ]
      }})
    );
  }

  /**
   * 5. Implement methods to handle user actions
   */

  public openListRow(row: any): void {
    this.router.navigate(['/cold_storage/transfers/', row.id]);
  }


  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ recipe_run_id: params.id })
      )
    );
  }

}
