import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';
import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellComponent, BooleanCellComponent, DateCellDataColumn, BooleanCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { InvestmentService } from '../../../services/investment/investment.service';
import { mergeMap } from 'rxjs/operators';

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
      { column: 'id', name: 'Id' },
      { column: 'started', name: 'Started' },
      { column: 'updated', name: 'Updated' },
      { column: 'completed', name: 'Completed' },
      { column: 'creator', name: 'Creator' },
      { column: 'strategy', name: 'Strategy' },
      { column: 'simulated', name: 'Simulated' },
      { column: 'deposit', name: 'Deposit' },
      { column: 'status', name: 'Status' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'created', name: 'Created', filter: {type: 'date', sortable: true }},
      { column: 'creator', name: 'Creator', filter: {type: 'text', sortable: true }},
      { column: 'status', name: 'Status', filter: {type: 'text', sortable: true }},
      { column: 'desicion_by', name: 'Desicion by', filter: {type: 'text', sortable: true }},
      { column: 'decision_time', name: 'Decision time', filter: {type: 'date', sortable: true }},
      { column: 'rationale', name: 'Rationale', filter: {type: 'text', sortable: true }},
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
    'status',
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'created' }),
    'creator',
    'status',
    'decision_by',
    new DateCellDataColumn({ column: 'decision_time' }),
    new ActionCellDataColumn({ column: 'rationale', inputs: {
        actions: [
          new DataCellAction({
            label: 'READ',
            exec: (row: any) => { this.readRationale(<any>row) }
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
        console.log(res);
        this.listDataSource.body = res.recipe_runs;
        this.count = res.count;
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
      },
      err => this.singleDataSource.body = []
    )
  }

  protected getTimelineData(): void {
    this.timelineEvents = [
      ...Array(2).fill(
        new TimelineEvent(
          'Investment run',
          'Orders filled',
          StatusClass.APPROVED,
          'IR-001, rci',
          (new Date()).toUTCString(),
          `/dashboard`
        )
      ),
      ...Array(3).fill(
        { note: 'Investments isn\'t made yet' }
      )
    ]
    this.setTagLine([
      new TagLineItem(`${0} Orders`),
      new TagLineItem(`${0} Execution orders`),
      new TagLineItem(`${0} Deposits`)
    ]);
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
        console.log(res);
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

  /**
   * Additional
   */

  public readRationale(row): void {
    alert(row.rationale)
  }

}
