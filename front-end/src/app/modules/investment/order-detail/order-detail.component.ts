import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

import { TimelineDetailComponent, SingleTableDataSource, TagLineItem } from '../timeline-detail/timeline-detail.component'
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';
import { ActionCellDataColumn, DataCellAction, DateCellDataColumn, PercentCellDataColumn, StatusCellDataColumn, ConfirmCellDataColumn, NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { mergeMap } from 'rxjs/operators';
import { InvestmentService } from '../../../services/investment/investment.service';

/**
 * 0. Set HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-order-detail',
  templateUrl: '../timeline-detail/timeline-detail.component.html',
  styleUrls: ['../timeline-detail/timeline-detail.component.scss']
})
export class OrderDetailComponent extends TimelineDetailComponent implements OnInit {

  /**
   * 1. Implement abstract attributes to display titles
   */
  public pageTitle: string = 'Recipe orders';
  public singleTitle: string = 'Recipe run';
  public listTitle: string = 'Orders';

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
      { column: 'rationale', name: 'Rationale' }
    ],
    body: null
  }

  public listDataSource: TableDataSource = {
    header: [
      { column: 'id', name: 'Id', filter: {type: 'text', sortable: true }},
      { column: 'instrument', name: 'Instrument', filter: {type: 'text', sortable: true }},
      { column: 'side', name: 'Side', filter: {type: 'text', sortable: true }},
      { column: 'price', name: 'Price', filter: {type: 'number', sortable: true }},
      { column: 'quantity', name: 'Quantity', filter: {type: 'number', sortable: true }},
      { column: 'fee', name: 'Sum of exchange trading fee', filter: {type: 'number', sortable: true }},
      { column: 'status', name: 'Status', filter: {type: 'text', sortable: true }}
    ],
    body: null,
  };

  public singleColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    new DateCellDataColumn({ column: 'creation_time' }),
    'instrument',
    'creator',
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      '41' : StatusClass.PENDING,
      '42': StatusClass.REJECTED,
      '43': StatusClass.APPROVED,
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

  public listColumnsToShow: Array<string | TableDataColumn> = [
    'id',
    'instrument',
    new StatusCellDataColumn({ column: 'side', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new NumberCellDataColumn({ column: 'price' }),
    new NumberCellDataColumn({ column: 'quantity' }),
    new NumberCellDataColumn({ column: 'fee' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: {
      '51': StatusClass.PENDING,
      '52': StatusClass.DEFAULT,
      '53': StatusClass.APPROVED,
      '54': StatusClass.REJECTED,
      '55': StatusClass.REJECTED,
      '56': StatusClass.FAILED,
    }}}),
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
        params => this.investmentService.getAllOrders(params['id'], this.requestData)
      )
    ).subscribe(
      res => {
        this.count = res.count;
        this.listDataSource.body = res.recipe_orders;
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
        if(res.recipe) {
          this.singleDataSource.body = [ res.recipe ];
        }
        if(res.recipe_stats) {
          this.setTagLine(res.recipe_stats.map(stat => {
            return new TagLineItem(`${stat.count} ${stat.name}`)
          }))
        }
      },
      err => this.singleDataSource.body = []
    )
  }

  protected getTimelineData(): void {
    this.timeline$ = this.investmentService.getTimelineData();
  }
  /**
   * 5. Implement abstract methods to handle user actions
   */

  public openSingleRow(row: any): void {
    this.router.navigate([`/run/recipe/${row.id}`])
  }

  public openListRow(row: any): void {
    this.router.navigate([`/run/execution-order/${row.id}`])
  }

  /**
   * + If custom ngOnInit() is needed, call super.ngOnInit() to
   * perform parent component class initialization
   */

  ngOnInit() {
    super.ngOnInit();
  }

}
