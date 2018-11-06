import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { DataTableFilterData } from '../data-table-filter/data-table-filter.component';

export interface TableDataSource {
  header: Array<TableDataSourceHeader>;
  body: Array<any>;
  footer?: Array<TableDataSourceFooter>;
}

export interface TableDataSourceHeader {
  column: string;
  nameKey: string;
  column_class?: string;
  filter?: {
    type: 'text' | 'date' | 'number';
    sortable?: boolean;
    /**
     * @param hasRange - False if you no need number range filter for number type filter
     */
    hasRange?: boolean;
    /**
     * @param inputSearch - Show/hide text search independent on filter type
     */
    inputSearch?: boolean;
    rowData?: Array<{
      value: string | boolean;
      label?: string;
    }>,
    rowData$?: Observable<Array<{
      value: string | boolean,
      label?: string
    }>>
  };
  _dirty?: boolean;
}

export interface TableDataSourceFooter {
  name: string;
  value: string;
  template: string;
  args?: object;
}

/**
 * column - key to access data from model
 * type - type of the field
 * format - (for type number) - https://angular.io/api/common/DecimalPipe, e.g., '3.1-5'
 * prefix - e.g., '$'
 * suffix - e.g., '%'
 */
export class TableDataColumn {
  column: string;
  component?: any;
  inputs?: { [key: string]: any };
  outputs?: { [key: string]: (ev) => void };
  constructor(val: TableDataColumn) {
    Object.assign(this, val);
  }
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  animations: [
    trigger('opacityAnimation', [
      state('show', style({
        opacity: '1',
      })),
      state('hide', style({
        opacity: '0',
      })),
      transition('* => *', animate('200ms')),
    ])
  ]
})
export class DataTableComponent implements OnInit {
  private filterMap: Object = {}; // Flag map is filter opened or not
  private filterAppliedMap: Object = {}; // Flag map is filter applied to column or not

  @Input() dataSource: TableDataSource;
  @Input() columnsToShow: Array<TableDataColumn>;
  @Input() customRows = false; // deprecated ???
  @Input() emptyText: string;
  @Input() loading = false;

  @Input() rowClass: (row: any) => string = (row) => '';

  @Output() setFilter = new EventEmitter<object>();
  @Output() openRow = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // use default empty table disclaimer text if no custom is given
    if (!this.emptyText) {
      this.translate.get('common.list_empty').subscribe(data => {
        this.emptyText = data;
      });
    }

    // generate filter flag objects
    this.filterMap = _.zipObject(
      this.columnsToShow.map(el => el.column),
      _.fill( Array(this.columnsToShow.length), false )
    );
    // clone object
    Object.apply(this.filterAppliedMap, this.filterMap);

    // remove all _dirty properties on url param change
    this.route.params.subscribe(params => {
      this.dataSource.header.map(item => {
        delete item._dirty;
        return item;
      });
    });

  }

  toggleFilter(item: any): void {
    // Make it dirty on open
    item._dirty = true;
    this.filterMap[item.column] = !this.filterMap[item.column];
  }

  /**
   *
   * @param filter
   * @returns True if column filter are set and table body isint null or empty
   */
  showFilter(filter: any) {
    return filter; // && this.dataSource.body && this.dataSource.body.length;
  }

  onSetFilter(filterData: DataTableFilterData): void {
    // mark filter as applied
    this.markFilterAppliedMap(filterData);

    this.setFilter.emit(filterData);
  }

  markFilterAppliedMap(filterData: DataTableFilterData): boolean {
    this.filterAppliedMap[filterData.column] = filterData.values.length || filterData.order;
    return this.filterAppliedMap[filterData.column];
  }

  onOpenRow(item: any): void {
    this.openRow.emit(item);
  }

  getFooterData(): Array<object> {
    return this.columnsToShow.map((col: TableDataColumn) => {
      return _.filter(this.dataSource.footer, ['name', col.column])[0] || { name: col.column };
    });
  }

  columnPosition (column): number {
    const columns = this.dataSource.header;
    return column === columns[0] ? -1 : column === columns[columns.length - 1] ? 1 : 0;
  }

  /**
   * Dynamic columns
   */

  columnIsBasic(column: TableDataColumn): boolean {
    return !column.component;
  }

  public dynamicInputs(column: TableDataColumn, value: any, row: any): any {
    return {
      ...(column.inputs || {}),
      row,
      value
    };
  }

  public dynamicOutputs(column: TableDataColumn): any {
    return {
      ...(column.outputs || {})
    };
  }

  /**
   * Style methods
   */

  public getRowClass(row: any): string {
    return this.rowClass(row);
  }

  public getColumnClass(column: any): string {
    const header = this.dataSource.header.find(h => h.column === column );
    if (header) { return header.column_class || ''; } else { return ''; }
  }

}
