import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataColumn, TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../../../shared/components/timeline/timeline.component';

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

export interface SingleTableDataSource extends TableDataSource {
  header: Array<{
    column: string
    nameKey: string
    // Does not have a filter
  }>;
  body: Array<object>;
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
export abstract class TimelineDetailComponent extends DataTableCommonManagerComponent implements OnInit {

  public tagLine: Array<TagLineItem> = [];

  /**
   * 1. Abstract attributes to display titles
   */
  public abstract pageTitle: string;
  public abstract singleTitle: string;
  public abstract listTitle: string;
  public addTitle: string;  // Optional
  public listTableEmptyText: string; // Optional

  /**
   * 2. Abstract attributes to preset data structure
   */
  public abstract singleDataSource: SingleTableDataSource;
  public abstract listDataSource: TableDataSource;

  public timeline$: Observable<Array<TimelineEvent>>;

  /**
   * Column config for data table
   * Every ...CellComponent has its ...CellDataColumn type class
   * Constructing it accepts an object of type ...CellDataColumn
   * This allows the compiler to type-check all inputs and outputs for a specific
   * component used. This config would be perfectly valid only by passing an object
   * that fits the type TableDataColumn, without constructing DataColumn classes, too.
   */
  public abstract singleColumnsToShow: Array<string | TableDataColumn>;
  public abstract listColumnsToShow: Array<string | TableDataColumn>;

  /**
   * 3. Construct with ActivatedRoute
   * @param route
   */
  constructor(
    public route: ActivatedRoute
  ) {
    super(route)
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
  public abstract getAllData(): void;
  protected abstract getSingleData(): void;
  protected abstract getTimelineData(): void;

  /**
   * 5. Abstract methods to handle user actions
   */
  public addAction(): void {
    // Do nothing by default
  }

  public abstract openSingleRow(row: any): void;
  public abstract openListRow(row: any): void;

  /**
   * Additional
   */

  public goBack(): void {

  }

  public setTagLine(items: Array<TagLineItem>): void {
    this.tagLine = items;
  }

  public doItemAction(item: TagLineItem): void {
    if(item.action) item.action();
  }

  /**
   * Rationale set modal
   */

  public rationaleModalIsShown: boolean = false;
  public rationaleData: any;
  public rationaleDone: (data: any) => void;

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
    if(typeof this.rationaleDone == 'function') {
      this.rationaleDone(data);
    }
    this.hideRationaleModal();
  }

  /**
   * Read set modal
   */

  public readModalIsShown: boolean = false;
  public readData: { title: string, content: string };

  public showReadModal(data: { title: string, content: string }): void {
    this.readModalIsShown = true;
    this.readData = data;
  }

  public hideReadModal(): void {
    this.readModalIsShown = false;
    this.readData = null;
  }

}
