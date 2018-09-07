import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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
  NumberCellDataColumn,
  StatusCellDataColumn,
  CurrencyCellDataColumn,
  PercentCellDataColumn
} from '../../../shared/components/data-table-cells';
import { InvestmentService } from '../../../services/investment/investment.service';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-investment-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class InvestmentRunDetailComponent extends TimelineDetailComponent implements OnInit, ITimelineDetailComponent {

  /**
   * 1. Implement attributes to display titles
   */
  public pageTitle = 'Recipe run';
  public singleTitle = 'Investment run';
  public listTitle = 'Recipe runs';
  public assetMixTitle = 'Selected asset mix';
  public addTitle = 'Start new run';
  public listTableEmptyText = 'investment.no_recipe_runs'; // custom data-table message on empty data set
  public assetMixCount;

  /**
   * 2. Implement attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'started_timestamp', nameKey: 'table.header.started' },
      { column: 'updated_timestamp', nameKey: 'table.header.updated' },
      { column: 'completed_timestamp', nameKey: 'table.header.completed' },
      { column: 'user_created', nameKey: 'table.header.creator' },
      { column: 'strategy_type', nameKey: 'table.header.strategy' },
      { column: 'is_simulated', nameKey: 'table.header.simulated' },
      { column: 'deposit_usd', nameKey: 'table.header.deposit' },
      { column: 'status', nameKey: 'table.header.status' }
    ],
    body: null
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'started_timestamp' }),
    new DateCellDataColumn({ column: 'updated_timestamp' }),
    new DateCellDataColumn({ column: 'completed_timestamp' }),
    new TableDataColumn({ column: 'user_created' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
    new StatusCellDataColumn({ column: 'is_simulated' }),
    new NumberCellDataColumn({ column: 'deposit_usd' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
  ];

  public assetMixDataSource: TableDataSource = {
    header: [
      { column: 'symbol', nameKey: 'table.header.symbol', filter: { type: 'text', sortable: true } },
      { column: 'long_name', nameKey: 'table.header.long_name', filter: { type: 'text', sortable: true } },
      { column: 'capitalization', nameKey: 'table.header.capitalisation', filter: { type: 'number', sortable: true } },
      { column: 'nvt_ratio', nameKey: 'table.header.nvt_ratio', filter: { type: 'number', sortable: true } },
      { column: 'market_share', nameKey: 'table.header.market_share', filter: { type: 'number', sortable: true } }
    ],
    body: null
  };

  public assetMixColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'symbol' }),
    new TableDataColumn({ column: 'long_name' }),
    new CurrencyCellDataColumn({ column: 'capitalization' }),
    new NumberCellDataColumn ({ column: 'nvt_ratio' }),
    new PercentCellDataColumn({ column: 'market_share' }),
  ];

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'created_timestamp', nameKey: 'table.header.created' },
      { column: 'user_created', nameKey: 'table.header.creator' },
      { column: 'approval_status', nameKey: 'table.header.status' },
      { column: 'approval_user', nameKey: 'table.header.decision_by' },
      { column: 'approval_timestamp', nameKey: 'table.header.decision_time' },
      { column: 'approval_comment', nameKey: 'table.header.rationale' },
    ],
    body: null
  };

  public listColumnsToShow: Array<TableDataColumn> = [
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

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private investmentService: InvestmentService,
    protected currencyPipe: CurrencyPipe,
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
        params => this.investmentService.getSingleInvestment(params['id'])
      )
    ).subscribe(
      res => {
        if (res.asset_mix) {
          Object.assign(this.assetMixDataSource, {
            body: res.asset_mix,
            footer: res.footer.map(item => {
              if ( item.name === 'capitalization' ) {
                item.args = _.mapValues(item.args, val => this.currencyPipe.transform(val, 'USD', 'symbol', '1.0-0'));
              }
              return item;
            })
          });
          this.assetMixCount = res.count;
          this.count = res.count;
        }
        if (res.investment_run) {
          this.singleDataSource.body = [ res.investment_run ];
        }
        if (res.investment_stats) {
          this.setTagLine(res.investment_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`);
          }));
        }
        if (res.investment_run.status === 'investment.status.303') {
          this.addTitle = '';
        }
      },
      err => this.singleDataSource.body = []
    );
  }

  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllRecipes(params['id'], this.requestData).pipe(
          finalize(() => this.stopTableLoading())
        )
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.recipe_runs;
        this.count = res.count;
        const statusPending = res.recipe_runs.filter(run => {
          return run.approval_status === 'recipes.status.41';
        });
        const statusApproved = res.recipe_runs.filter(run => {
          return run.approval_status === 'recipes.status.43';
        });
        if (statusPending.length || statusApproved.length) {
          this.addTitle = '';
        }
      },
      err => this.listDataSource.body = []
    );
  }

  public getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ investment_run_id: params['id'] })
      )
    );
  }

  /**
   * 5. Implement methods to handle user actions
   */

  public addAction(): void {
    const recipeRun = {};
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.createRecipeRun(params['id'], recipeRun)
      )
    ).subscribe(
      res => {
        if (res.success) {
          this.getAllData();
          this.getSingleData();
        }
      }
    );
  }

  public openListRow(row: any): void {
    this.router.navigate([`/run/recipe/${row.id}`]);
  }

}
