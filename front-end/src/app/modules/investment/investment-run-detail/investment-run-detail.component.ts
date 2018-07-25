import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';
import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellComponent, BooleanCellComponent, DateCellDataColumn, BooleanCellDataColumn, NumberCellDataColumn, StatusCellDataColumn } from '../../../shared/components/data-table-cells';
import { InvestmentService } from '../../../services/investment/investment.service';
import { mergeMap, map } from 'rxjs/operators';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-investment-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class InvestmentRunDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe run';
  public singleTitle: string = 'Investment run';
  public listTitle: string = 'Recipe runs';
  public addTitle: string = 'Start new run';

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'started', nameKey: 'table.header.started' },
      { column: 'updated', nameKey: 'table.header.updated' },
      { column: 'completed', nameKey: 'table.header.completed' },
      { column: 'creator', nameKey: 'table.header.creator' },
      { column: 'strategy', nameKey: 'table.header.strategy' },
      { column: 'simulated', nameKey: 'table.header.simulated' },
      { column: 'deposit', nameKey: 'table.header.deposit' },
      { column: 'status', nameKey: 'table.header.status' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: {type: 'text', sortable: true }},
      { column: 'created', nameKey: 'table.header.created', filter: {type: 'date', sortable: true }},
      { column: 'creator', nameKey: 'table.header.creator', filter: {type: 'text', sortable: true }},
      { column: 'status', nameKey: 'table.header.status', filter: {type: 'text', sortable: true }},
      { column: 'decision_by', nameKey: 'table.header.decision_by', filter: {type: 'text', sortable: true }},
      { column: 'decision_time', nameKey: 'table.header.decision_time', filter: {type: 'date', sortable: true }},
      { column: 'rationale', nameKey: 'table.header.rationale', filter: {type: 'text', sortable: true }},
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'started' }),
    new DateCellDataColumn({ column: 'updated' }),
    new DateCellDataColumn({ column: 'completed' }),
    'creator',
    'strategy',
    new BooleanCellDataColumn({ column: 'simulated' }),
    new NumberCellDataColumn({ column: 'deposit' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'created' }),
    'creator',
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    'decision_by',
    new DateCellDataColumn({ column: 'decision_time' }),
    new ActionCellDataColumn({ column: 'rationale', inputs: {
        actions: [
          new DataCellAction({
            label: 'READ',
            exec: (row: any) => {
              this.showReadModal({
                title: 'Rationale',
                content: row.rationale
              })
            }
          })
        ]
      }
    }),
  ];

  /**
   * 3. Call super() with ActivatedRoute
   * @param route - ActivatedRoute, used in DataTableCommonManagerComponent
   */
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private investmentService: InvestmentService
  ) {
    super(route);
  }

  /**
   * 4. Implement abstract methods to fetch data OnInit
   */
  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllRecipes(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.count = res.count;
        this.listDataSource.body = res.recipe_runs;
        this.listDataSource.footer = res.footer;
      },
      err => this.listDataSource.body = []
    )
  }

  protected getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleInvestment(params['id'])
      )
    ).subscribe(
      res => {
        if(res.investment_run) {
          this.singleDataSource.body = [ res.investment_run ];
        }
        if(res.investment_stats) {
          this.setTagLine(res.investment_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`)
          }))
        }
      },
      err => this.singleDataSource.body = []
    )
  }

  protected getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getInvestmentStats(params['id'])
      )
    )
  }

  /**
   * 5. Implement abstract methods to handle user actions
   */

  public addAction(): void {

    let recipeRun = {};

    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.createRecipeRun(params['id'], recipeRun)
      )
    ).subscribe(
      res => {
        this.listDataSource.body.push(res);
      }
    )
  }

  public openSingleRow(row: any): void {
    // Do nothing
  }

  public openListRow(row: any): void {
    this.router.navigate([`/run/recipe/${row.id}`])
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }

}
