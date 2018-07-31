import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn, ConfirmCellDataColumn } from '../../../shared/components/data-table-cells';
import { mergeMap, map } from 'rxjs/operators';
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
      { column: 'id', nameKey: 'table.header.id' },
      { column: 'creation_time', nameKey: 'table.header.creation_time' },
      { column: 'instrument', nameKey: 'table.header.instrument' },
      { column: 'creator', nameKey: 'table.header.creator' },
      { column: 'status', nameKey: 'table.header.status' },
      { column: 'decision_by', nameKey: 'table.header.decision_by' },
      { column: 'decision_time', nameKey: 'table.header.decision_time' },
      { column: 'rationale', nameKey: 'table.header.rationale' },
      { column: 'actions', nameKey: 'table.header.actions' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: {type: 'text', sortable: true }},
      { column: 'transaction_asset', nameKey: 'table.header.transaction_asset', filter: {type: 'text', sortable: true }},
      { column: 'quote_asset', nameKey: 'table.header.quote_asset', filter: {type: 'text', sortable: true }},
      { column: 'exchange', nameKey: 'table.header.exchange', filter: {type: 'text', sortable: true }},
      { column: 'percentage', nameKey: 'table.header.percentage', filter: {type: 'number', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'creation_time' }),
    new TableDataColumn({ column: 'instrument' }),
    new TableDataColumn({ column: 'creator' }),
    new StatusCellDataColumn({ column: 'approval_status', inputs: { classMap: {
      '41' : StatusClass.PENDING,
      '42': StatusClass.REJECTED,
      '43': StatusClass.APPROVED,
    }}}),
    new TableDataColumn({ column: 'decision_by' }),
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
    new ConfirmCellDataColumn({ column: 'actions', inputs: {
      execConfirm: (row) => this.showRationaleModal(row, data => data && this.confirmRun(data)),
      execDecline: (row) => this.showRationaleModal(row, data => data && this.declineRun(data)),
    } }),  // TODO: Actions component
  ];

  public listColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'transaction_asset' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new TableDataColumn({ column: 'exchange' }),
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
    this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllRecipeDetails(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.count = res.count;
        this.listDataSource.body = res.recipe_details;
        this.listDataSource.footer = res.footer;
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
        if(res.recipe_stats) {
          this.setTagLine(res.recipe_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`)
          }))
        }
      },
      // err => this.singleDataSource.body = []
    )
  }

  protected getTimelineData(): void {
    this.timeline$ = this.route.params.pipe(
      mergeMap(
        params => this.investmentService.getAllTimelineData({ "recipe_run_id": params['id'] })
      )
    )
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

  private confirmRun({ rationale, data }): void {
    let run = data;
    this.investmentService.approveRecipe(run.id, { status: true, comment: rationale }).subscribe(
      res => {
        // TODO
      }
    )
  }

  private declineRun({ rationale, data }): void {
    let run = data;
    this.investmentService.approveRecipe(run.id, { status: false, comment: rationale }).subscribe(
      res => {
        // TODO
      }
    )
  }

}
