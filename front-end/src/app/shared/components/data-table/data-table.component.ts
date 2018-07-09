import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import _ from 'lodash';

export interface TableDataSource {
  header: Array<{
    column: string
    name: string
    filter?: {
      type: 'text' | 'date' | 'number'
      sortable?: boolean
      rowData?: Array<string>
    }
  }>;
  body: Array<object>;
  footer?: Array<string>;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  private filterMap: Object;

  @Input() dataSource: TableDataSource;
  @Input() columnsToShow: Array<String>;

  @Output() setFilter = new EventEmitter<object>();

  constructor() {}

  ngOnInit() {
    this.filterMap = _.zipObject(
      this.columnsToShow,
      _.fill( Array(this.columnsToShow.length), false )
    );
  }

  onSetFilter(value) {
    this.setFilter.emit(value);
  }

  onToggleFilter(column) {
    this.filterMap[column] = !this.filterMap[column];
  }
}
