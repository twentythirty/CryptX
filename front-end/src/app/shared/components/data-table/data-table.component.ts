import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";

export interface TableDataSource {
  header: Array<{
    column: string
    nameKey: string
    column_class?: string
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

  @Input() dataSource: TableDataSource;
  @Input() columnsToShow: Array<string | TableDataColumn>;
  @Input() customRows: boolean = false;
  @Input() emptyText: string;

  @Input() rowBackgroundColor: (row: any) => string = (row) => null;
  @Input() rowTexColor: (row: any) => string = (row) => null;

  @Output() setFilter = new EventEmitter<object>();
  @Output() openRow = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // use default empty table disclaimer text if no custom is given
    if(!this.emptyText) {
      this.translate.get('common.list_empty').subscribe(data => {
        this.emptyText = data;
      });
    }
    this.filterMap = _.zipObject(
      this.columnsToShow.map(el => (typeof el == 'string') ? el : el.column ),
      _.fill( Array(this.columnsToShow.length), false )
    );

    // remove all _dirty properties on url change
     this.router.events.subscribe((val) => {
        if(val instanceof NavigationStart){
          this.dataSource.header.map(item => {
            delete item._dirty;
            return item;
          });
        }
        
    });
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

  public getColumnClass(column: any): string {
    const header = this.dataSource.header.find(h => h.column === column );
    if(header) return header.column_class || '';
    else return '';
  }

}
