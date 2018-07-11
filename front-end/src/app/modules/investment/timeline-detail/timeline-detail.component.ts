import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { ActivatedRoute } from '@angular/router';
import { TableDataColumn, TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { TimelineEvent } from '../timeline/timeline.component';

export interface SingleTableDataSource extends TableDataSource {
  header: Array<{
    column: string
    name: string
    // Does not have a filter
  }>;
  body: Array<object>;
  footer?: undefined;
}

@Component({
  selector: 'app-timeline-detail',
  templateUrl: './timeline-detail.component.html',
  styleUrls: ['./timeline-detail.component.scss']
})
export abstract class TimelineDetailComponent extends DataTableCommonManagerComponent implements OnInit {

  public abstract pageTitle: string;
  public abstract singleTitle: string;
  public abstract listTitle: string;
  public abstract addTitle: string;

  public abstract timelineEvents: Array<TimelineEvent>;

  public singleDataSource: SingleTableDataSource;
  public listDataSource: TableDataSource;

  /**
   * Column config for data table
   * Every ...CellComponent has its ...CellDataColumn type class
   * Constructing it accepts an object of type ...CellDataColumn
   * This allows the compiler to type-check all inputs and outputs for a specific
   * component used. This config would be perfectly valid only by passing an object
   * that fits the type TableDataColumn, without constructing DataColumn classes, too.
   */
  public listColumnsToShow: Array<string | TableDataColumn>;

  constructor(
    protected route: ActivatedRoute
  ) {
    super(route)
  }

  ngOnInit() {
    super.ngOnInit();
    this.getSingleData();
  }

  public abstract getAllData(): void;

  protected abstract getSingleData(): void;

  public abstract addAction(): void;
}
