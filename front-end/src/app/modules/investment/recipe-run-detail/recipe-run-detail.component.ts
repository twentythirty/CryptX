import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { StatusClass } from '../../../shared/models/common';

import {
  TimelineDetailComponent,
  SingleTableDataSource,
  TagLineItem,
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

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-recipe-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class RecipeRunDetailComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {

  /**
   * 1. Implement attributes to display titles
   */
  public pageTitle = 'Recipe run';
  public singleTitle = 'Recipe run';
  public listTitle = 'Recipe run details';
  public recipeStatus;

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
      // { column: 'actions', nameKey: 'table.header.actions' }
    ],
    body: null
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'created_timestamp' }),
    new TableDataColumn({ column: 'user_created' }),
    new StatusCellDataColumn({ column: 'approval_status', inputs: { classMap: {
      'recipes.status.41': StatusClass.PENDING,
      'recipes.status.42': StatusClass.REJECTED,
      'recipes.status.43': StatusClass.APPROVED,
    }}}),
    new TableDataColumn({ column: 'approval_user' }),
    new DateCellDataColumn({ column: 'approval_timestamp' }),
    new ActionCellDataColumn({ column: 'approval_comment', inputs: {
      actions: [
        new DataCellAction({
          label: 'READ',
          isShown: row => row.approval_status !== 'recipes.status.41',
          exec: (row: any) => {
            this.showReadModal({
              title: 'Rationale',
              content: row.approval_comment
            });
          }
        })
      ]
    }}),
   /* new ConfirmCellDataColumn({ column: 'actions', inputs: {
      show: (row) => true,
      execConfirm: (row) => this.showRationaleModal(row, data => data && this.confirmRun(data)),
      execDecline: (row) => this.showRationaleModal(row, data => data && this.declineRun(data)),
    } }),  // TODO: Actions component */
  ];

  public listDataSource: TableDataSource = {
    header: [
      { column: 'transaction_asset', nameKey: 'table.header.transaction_asset', filter: { type: 'text', sortable: true }},
      { column: 'quote_asset', nameKey: 'table.header.quote_asset', filter: { type: 'text', sortable: true }},
      { column: 'target_exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true }},
      { column: 'investment_usd', nameKey: 'table.header.investment_usd', filter: { type: 'number', sortable: true }},
      { column: 'investment_btc', nameKey: 'table.header.investment_btc', filter: { type: 'number', sortable: true }},
      { column: 'investment_eth', nameKey: 'table.header.investment_eth', filter: { type: 'number', sortable: true }}
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'transaction_asset' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new TableDataColumn({ column: 'target_exchange' }),
    new NumberCellDataColumn({ column: 'investment_usd', inputs: {
      digitsInfo: '1.2-4'
    } }),
    new NumberCellDataColumn({ column: 'investment_btc', inputs: {
      digitsInfo: '1.2-4'
    } }),
    new NumberCellDataColumn({ column: 'investment_eth', inputs: {
      digitsInfo: '1.2-4'
    } }),
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
  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllRecipeDetails(params['id'], this.requestData).pipe(
          finalize(() => this.stopTableLoading())
        )
      )
    ).subscribe(
      res => {
        Object.assign(this.listDataSource, {
          body: res.recipe_details,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      },
      err => this.listDataSource.body = []
    );
  }

  private getFilterLOV(): void {
    this.listDataSource.header.filter(
      col => ['id', 'transaction_asset', 'quote_asset', 'target_exchange'].includes(col.column)
    ).map(
      col => {
        const filter = {filter : {recipe_run_id: this.routeParamId}};
        col.filter.rowData$ = this.investmentService.getAllRecipeDetailsHeaderLOV(col.column, filter);
      }
    );
  }

  public getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleRecipe(params['id'])
      )
    ).subscribe(
      res => {
        if (res.recipe_run) {
          this.singleDataSource.body = [ res.recipe_run ];
          this.recipeStatus = [res.recipe_run];
          this.appendActionColumn();
        }
        if (res.recipe_stats) {
          this.setTagLine(res.recipe_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`);
          }));
        }
      },
      // err => this.singleDataSource.body = []
    );
  }

  private appendActionColumn() {
    if (!_.find(this.singleDataSource.header, col => col.column === 'actions')) {
      if (this.recipeStatus[0].approval_status === 'recipes.status.41') {
        this.singleDataSource.header.push({ column: 'actions', nameKey: 'table.header.action' });
        this.singleColumnsToShow.push(
          new ConfirmCellDataColumn({ column: 'actions', inputs: {
            show: (row) => true,
            execConfirm: (row) => this.showRationaleModal(row, data => data && this.confirmRun(data)),
            execDecline: (row) => this.showRationaleModal(row, data => data && this.declineRun(data)),
          } })
        );
      }
    }
  }

  private removeActionColumn() {
    this.singleDataSource.header.splice(-1, 1);
    this.singleColumnsToShow.splice(-1, 1);
  }

  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ recipe_run_id: params['id'] })
      )
    );
  }

  /**
   * Additional
   */

 private confirmRun({ rationale, data }): void {
    const run = data;
    this.investmentService.approveRecipe(run.id, { status: 43, comment: rationale }).subscribe(
      res => {
        if (res.success) {
          this.getSingleData();
          this.getTimelineData();
          this.removeActionColumn();
        }
        // TODO
      }
    );
  }

  private declineRun({ rationale, data }): void {
    const run = data;
    this.investmentService.approveRecipe(run.id, { status: 42, comment: rationale }).subscribe(
      res => {
        if (res.success) {
          this.getSingleData();
          this.getTimelineData();
          this.removeActionColumn();
        }
      }
    );
  }

}
