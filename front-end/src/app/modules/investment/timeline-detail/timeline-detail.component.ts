import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataColumn, TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';

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
    name: string
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

  /**
   * 2. Abstract attributes to preset data structure
   */
  public abstract timelineEvents: Array<TimelineEvent>;

  public abstract singleDataSource: SingleTableDataSource;
  public abstract listDataSource: TableDataSource;

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

  public setListFooter(res): void {
    if(res.footer) {
      this.listDataSource.footer = this.listColumnsToShow.map(col => {
        let key = (typeof col == 'string') ? col : col.column;
        return (res.footer.find(f => f.name == key) || {}).value || '';
      })
    }
  }

}
