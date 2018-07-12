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

/**
 * 0. HTML and SCSS files in component decorator
 */
@Component({
  selector: 'app-timeline-detail',
  templateUrl: './timeline-detail.component.html',
  styleUrls: ['./timeline-detail.component.scss']
})
export abstract class TimelineDetailComponent extends DataTableCommonManagerComponent implements OnInit {

  /**
   * 1. Abstract attributes to display titles
   */
  public abstract pageTitle: string;
  public abstract singleTitle: string;
  public abstract listTitle: string;
  public abstract addTitle: string;

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
  public abstract addAction(): void;
  public abstract openSingleRow(row: any): void;
  public abstract openListRow(row: any): void;

}
