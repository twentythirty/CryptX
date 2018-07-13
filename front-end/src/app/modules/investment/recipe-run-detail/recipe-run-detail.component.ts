import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn, ConfirmCellDataColumn } from '../../../shared/components/data-table-cells';
import { mergeMap } from 'rxjs/operators';
import { InvestmentService } from '../../../services/investment/investment.service';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-recipe-run-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class RecipeRunDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe run';
  public singleTitle: string = 'Recipe runs';
  public listTitle: string = 'Recipe run details';

  /**
   * 2. Implement abstract attributes to preset data structure
   */
  public timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource = {
    header: [
      { column: 'id', name: 'Id' },
      { column: 'creation_time', name: 'Creation time' },
      { column: 'instrument', name: 'Instrument' },
      { column: 'creator', name: 'Creator' },
      { column: 'status', name: 'Status' },
      { column: 'decision_by', name: 'Decision by' },
      { column: 'decision_time', name: 'Decision time' },
      { column: 'rationale', name: 'Rationale' },
      { column: 'actions', name: 'Actions' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'transaction_asset', name: 'Transaction asset', filter: {type: 'text', sortable: true }},
      { column: 'quote_asset', name: 'Quote asset', filter: {type: 'text', sortable: true }},
      { column: 'exchange', name: 'Exchange', filter: {type: 'text', sortable: true }},
      { column: 'percentage', name: 'Percentage, %', filter: {type: 'number', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'creation_time' }),
    'instrument',
    'creator',
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      'pending' : StatusClass.PENDING,
      'rejected': StatusClass.REJECTED,
      'approved': StatusClass.APPROVED
    }}}),
    'decision_by',
    new DateCellDataColumn({ column: 'decision_time' }),
    'rationale',
    new ConfirmCellDataColumn({ column: 'actions', inputs: {
      execConfirm: (row) => this.confirmRun(row),
      execDecline: (row) => this.declineRun(row),
    } }),  // TODO: Actions component
  ];

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'transaction_asset',
    'quote_asset',
    'exchange',
    new PercentCellDataColumn({ column: 'percentage' })
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
    console.log(this.requestData);
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllRecipeDetails(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.listDataSource.body = res.recipe_details;
        this.count = res.count;
      },
      err => this.listDataSource.body = []
    )
  }

  protected getSingleData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getSingleRecipe(params['id'])
      )
    ).subscribe(
      res => {
        if(res.recipe_run) {
          this.singleDataSource.body = [ res.recipe_run ];
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

  public openSingleRow(row: any): void {
    // Do nothing
  }

  public openListRow(row: any): void {
    // Do nothing
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

  private confirmRun(run: any): void {
    alert('confirmRun');
  }

  private declineRun(run: any): void {
    alert('declineRun');
  }


}
