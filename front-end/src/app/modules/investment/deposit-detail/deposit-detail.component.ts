import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, finalize } from 'rxjs/operators';

import { StatusClass } from '../../../shared/models/common';

import {
  TimelineDetailComponent,
  SingleTableDataSource,
  TagLineItem,
  ITimelineDetailComponent
} from '../timeline-detail/timeline-detail.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import {
  DateCellDataColumn,
  StatusCellDataColumn,
  DataCellAction,
  ActionCellDataColumn,
  NumberCellDataColumn
} from '../../../shared/components/data-table-cells';

import { InvestmentService } from '../../../services/investment/investment.service';

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
  public singleTitle = 'Recipe run';
  public listTitle = 'Deposits';

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'created_timestamp', nameKey: 'table.header.creation_time' },
      { column: 'user_created', nameKey: 'table.header.creator' },
      { column: 'approval_status', nameKey: 'table.header.status' },
      { column: 'approval_user', nameKey: 'table.header.decision_by' },
      { column: 'approval_timestamp', nameKey: 'table.header.decision_time' },
      { column: 'approval_comment', nameKey: 'table.header.rationale' },
    ],
    body: null
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'created_timestamp' }),
    new TableDataColumn({ column: 'user_created' }),
    new StatusCellDataColumn({ column: 'approval_status', inputs: { classMap: {
      'recipes.status.41' : StatusClass.PENDING,
      'recipes.status.42': StatusClass.REJECTED,
      'recipes.status.43': StatusClass.APPROVED,
    }}}),
    new TableDataColumn({ column: 'approval_user' }),
    new DateCellDataColumn({ column: 'approval_timestamp' }),
    new ActionCellDataColumn({ column: 'approval_comment', inputs: {
      actions: [
        new DataCellAction({
          label: 'READ',
          exec: (row: any) => {
            this.showReadModal({
              title: 'Rationale',
              content: row.approval_comment
            });
          }
        })
      ]
    }}),
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

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router,
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
        params => this.investmentService.getSingleRecipe(params['id'])
      )
    ).subscribe(
      res => {
        if (res.recipe_run) {
          this.singleDataSource.body = [ res.recipe_run ];
        }
        if (res.recipe_stats) {
          this.setTagLine(
            res.recipe_stats.map(o => new TagLineItem(`${o.count} ${o.name}`))
          );
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
        this.count = res.count;
        this.listDataSource.body = res.recipe_deposits;
        this.listDataSource.footer = res.footer;
        this.getFilterLOV();
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


}
