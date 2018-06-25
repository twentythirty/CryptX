import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import _ from 'lodash';

interface TableDataSource {
  header: Array<object>;
  body: Array<object>;
  footer: Array<object>;
}

interface OrderBy {
  by: string
  order: 'asc' | 'desc'
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  @Input() dataSource: TableDataSource;
  @Input() columnsToShow: Array<String>;
  @Input() orderBy: Array<OrderBy>;

  @Output() setOrderBy = new EventEmitter<object>();

  constructor() { }

  ngOnInit() {
  }

  onSetOrderBy(column: string): void {
    let obj = _.find(this.orderBy, o => o.by === column );

    if ( obj ) {
      if ( obj.order === 'asc' )
        obj.order = 'desc';
      else
        obj.order = 'asc';
    } else {
      if (!this.orderBy) {
        this.orderBy = [];
      }

      this.orderBy.push({
        by: column,
        order: 'asc'
      });
    }

    this.setOrderBy.emit(this.orderBy);
  }

  isColumnSortable(columnItem) {
    return columnItem.sortable === undefined || columnItem.sortable;
  }

  isColumnOrdered(column: String) {
    return _.find(this.orderBy, o => o.by === column );
  }

  isColumnASC(column: String) {
    return _.find(this.orderBy, o => o.by === column && o.order === 'asc' );
  }

  isColumnDESC(column: String) {
    return _.find(this.orderBy, o => o.by === column && o.order === 'desc' );
  }
}
