import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataColumn, TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { ActionLog } from '../../../shared/models/actionLog';

/**
 * Usage:
 *
 * 0. Set HTML and SCSS files in component decorator
 *
 * 1. Implement abstract attributes to display titles
 * 2. Implement abstract attributes to preset data structure
 * 3. Call super() with ActivatedRoute
 * 4. Implement abstract methods to fetch data OnInit
 * 5. Implement abstract methods to handle user actions
 * +  If custom ngOnInit() is needed, call super.ngOnInit() to
 *    perform parent component class initialization
 */

export interface ITimelineDetailComponent {
  pageTitle: string;
  singleTitle: string;
  listTitle: string;
  addTitle?: string;  // Optional
  singleTableEmptyText?: string; // Optional
  listTableEmptyText?: string; // Optional
  depositApproveId?: number; // Optional

  showGenerateOrders?: boolean; // Optional
  showConversionAmountModal?: boolean; // Optional
  generateOrdersLoading?: boolean; // Optional

  singleDataSource: SingleTableDataSource;
  listDataSource: TableDataSource;

  timeline$: Observable<Array<TimelineEvent>>;

  singleColumnsToShow: Array<string | TableDataColumn>;
  listColumnsToShow: Array<string | TableDataColumn>;

  getAllData: () => void;
  getSingleData: () => void;
  getTimelineData: () => void;

  addAction?: () => void; // optional

  generateOrders?: () => void; // optional
  showCalculateDeposits?: () => boolean; // optional

  openSingleRow: (row: any) => void; // optional
  openListRow: (row: any) => void; // optional

  goBack?: () => void; // optional

  /**
   * Rationale set modal
   */
  rationaleModalIsShown?: boolean;
  rationaleData?: any;
  rationaleDone?: (data: any) => void;

  /**
   * Read set modal
   */
  readModalIsShown?: boolean;
  readData?: { title: string, content: string };

  depositApproveUpdateData?: () => void;
}

export interface SingleTableDataSource extends TableDataSource {
  header: Array<{
    column: string
    nameKey: string
    // Does not have a filter
  }>;
  body: Array<any>;
  footer?: undefined;
}

export class TagLineItem {
  constructor(
    public title: string,
    public action?: () => void
  ) {}
}

/**
 * 0. HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-timeline-detail',
  templateUrl: './timeline-detail.component.html',
  styleUrls: ['./timeline-detail.component.scss']
})
export class TimelineDetailComponent extends DataTableCommonManagerComponent implements OnInit {

  public tagLine: Array<TagLineItem> = [];

  /**
   * 1. Abstract attributes to display titles
   */
  public pageTitle: string;
  public singleTitle: string;
  public listTitle: string;
  public extraTableTitle: string;
  public detailTableTitle: string;
  public addTitle: string;  // Optional
  public singleTableEmptyText: string; // Optional
  public listTableEmptyText: string; // Optional
  public depositApproveId: number = null;

  public showGenerateOrders = false; // Optional
  public showConversionAmountModal = false; // Optional
  public generateOrdersLoading = false; // Optional

  public logsTitle: string; // Optional
  public logsSource: Array<ActionLog>; // Optional

  /**
   * 2. Abstract attributes to preset data structure
   */
  public singleDataSource: SingleTableDataSource;
  public listDataSource: TableDataSource;
  public extraTableDataSource: TableDataSource;
  public detailTableDataSource: TableDataSource;

  public timeline$: Observable<Array<TimelineEvent>>;

  /**
   * Column config for data table
   * Every ...CellComponent has its ...CellDataColumn type class
   * Constructing it accepts an object of type ...CellDataColumn
   * This allows the compiler to type-check all inputs and outputs for a specific
   * component used. This config would be perfectly valid only by passing an object
   * that fits the type TableDataColumn, without constructing DataColumn classes, too.
   */
  public singleColumnsToShow: Array<string | TableDataColumn>;
  public listColumnsToShow: Array<string | TableDataColumn>;
  public extraTableColumnsToShow: Array<string | TableDataColumn>;
  public detailTableColumnsToShow: Array<string | TableDataColumn>;

  /**
   * 3. Construct with ActivatedRoute
   * @param route
   */
  constructor(
    public route: ActivatedRoute,
    public router: Router
  ) {
    super(route, router);
  }

  /**
   * + NgOnInit
   */
  ngOnInit() {
    super.ngOnInit();
    this.getSingleData();
    this.getTimelineData();
  }

  /**
   * 4. Abstract methods to fetch data OnInit
   */
  public getAllData(): void {}
  protected getSingleData(): void {}
  protected getTimelineData(): void {}

  /**
   * 5. Abstract methods to handle user actions
   */
  public addAction(): void {
    // Do nothing by default
  }

  public generateOrders(): void {
    // Do nothing by default
  }

  public showCalculateDeposits(): boolean {
    return false;
  }

  public openSingleRow(row: any): void {}
  public openListRow(row: any): void {}
  public openDetailRow(row: any): void {}

  /**
   * Additional
   */

  public goBack(): void {}

  public setTagLine(items: Array<TagLineItem>): void {
    this.tagLine = items;
  }

  public doItemAction(item: TagLineItem): void {
    if (item.action) { item.action(); }
  }

  /**
   * Rationale set modal
   */

  public rationaleModalIsShown = false;
  public rationaleData;
  public rationaleDone;

  public showRationaleModal(data: any, done?: (data: any) => void): void {
    this.rationaleModalIsShown = true;
    this.rationaleData = data;
    this.rationaleDone = done;
  }

  public hideRationaleModal(): void {
    this.rationaleModalIsShown = false;
    this.rationaleData = null;
    this.rationaleDone = null;
  }

  public submitRationale(data): void {
    if (typeof this.rationaleDone === 'function') {
      this.rationaleDone(data);
    }
    this.hideRationaleModal();
  }

  /**
   * Read set modal
   */

  public readModalIsShown = false;
  public readData;

  public showReadModal(data: { title: string, content: string }): void {
    this.readModalIsShown = true;
    this.readData = data;
  }

  public hideReadModal(): void {
    this.readModalIsShown = false;
    this.readData = null;
  }

  depositApproveUpdateData(): void {}

}
