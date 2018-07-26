import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import _ from 'lodash';

export interface TableDataSource {
  header: Array<{
    column: string
    nameKey: string
    filter?: {
      type: 'text' | 'boolean' | 'date' | 'number'
      sortable?: boolean
      rowData?: Array<{
        value: string | boolean,
        label?: string
      }>,
      rowData$?: Observable<Array<{
        value: string | boolean,
        label?: string
      }>>
    },
    _dirty?: boolean;
  }>;
  body: Array<object>;
  footer?: Array<{
    name: string
    value: string
    template: string
    args?: object
  }>;
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
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  private filterMap: Object;
  total

  @Input() dataSource: TableDataSource;
  @Input() columnsToShow: Array<string | TableDataColumn>;
  @Input() customRows: boolean = false;

  @Input() rowBackgroundColor: (row: any) => string = (row) => null;
  @Input() rowTexColor: (row: any) => string = (row) => null;

  @Output() setFilter = new EventEmitter<object>();
  @Output() openRow = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {
    this.filterMap = _.zipObject(
      this.columnsToShow.map(el => (typeof el == 'string') ? el : el.column ),
      _.fill( Array(this.columnsToShow.length), false )
    );
  }

  toggleFilter(item: any): void {
    // Make it dirty on open
    item._dirty = true;
    this.filterMap[item.column] = !this.filterMap[item.column];
  }

  onSetFilter(value): void {
    this.setFilter.emit(value);
  }

  onOpenRow(item: any): void {
    this.openRow.emit(item);
  }

  onToggleFilter(column): void {
    this.filterMap[column] = !this.filterMap[column];
  }

  getFooterData(): Array<object> {
    return this.columnsToShow.map(col => {
      return _.filter(this.dataSource.footer, ['name', (typeof col == 'string') ? col : col.column])[0];
    });
  }

  /**
   * Dynamic columns
   */

  columnIsBasic(column: string | TableDataColumn): boolean {
    return typeof column == 'string' || !column.component;
  }

  public dynamicInputs(column: TableDataColumn, value: any, row: any): any {
    return {
      ...(column.inputs || {}),
      row,
      value
    }
  }

  public dynamicOutputs(column: TableDataColumn): any {
    return {
      ...(column.outputs || {})
    }
  }

  /**
   * Style methods
   */

  public getRowBackgroundColor(row: any): string {
    return this.rowBackgroundColor(row) || null;
  }

  public getRowTexColor(row: any): string {
    return this.rowTexColor(row) || null;
  }

}
