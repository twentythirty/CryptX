import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

export interface DataTableFilterData {
  column: string
  values: Array<{
    field: string
    value: any,
    expression?: string,
    type?: string
  }>
  order?: {
    by: string
    order: string
  }
}

@Component({
  selector: 'app-data-table-filter',
  templateUrl: './data-table-filter.component.html',
  styleUrls: ['./data-table-filter.component.scss']
})
export class DataTableFilterComponent implements OnInit, OnChanges {
  private _filterData = {
    values: [],
    order: ''
  };
  public _showSearch: boolean = false;
  public _filterSearchText: string = '';

  active = false;
  name = 'ORDER BY';
  rowDataLoading: boolean = false;

  @Input() column: string;
  @Input() type: string = 'text';
  @Input() sortable: boolean = true;
  @Input() hasRange: boolean = true;
  @Input() inputSearch: boolean = false;
  @Input() rowData: Array<{
    value: string | boolean | number,
    label?: string
  }> = [];

  @Input() rowData$: Observable<Array<{
    value: string | boolean | number,
    label?: string
  }>>;
  @Input() dirty: boolean;

  @Output() onFilter = new EventEmitter<object>();

  constructor() {}

  ngOnInit() {
    // setting default value
    this.hasRange = _.isUndefined(this.hasRange) ? true : this.hasRange;
    this.inputSearch = _.isUndefined(this.inputSearch) ? false : this.inputSearch;
  }

  ngOnChanges(changes) {
    // Runs when filter becomes dirty
    if(changes.dirty && !changes.dirty.previousValue && (changes.dirty.currentValue === true)) {
      this.rowData = [];
      this.getRowData$();
    }
  }

  onFilterChange() {
    let data: DataTableFilterData = {
      column: this.column,
      values: [],
    };

    switch(this.type) {
      case 'text':
        if (this.rowData && this.rowData.length && this._filterData.values.length) {
          // checkbox data pick
          data.values.push({
            field: this.column,
            value: this._filterData.values,
            expression: 'in',
            type: 'string'
          });
        } else if ( this._filterSearchText.length ) {
          // search field data
          data.values.push({
            field: this.column,
            value: `%${this._filterSearchText}%`,
            expression: 'iLike',
            type: 'string'
          });
        }
        break;

      case 'boolean':
        if (this.rowData && this.rowData.length && this._filterData.values.length === 1) {
          // checkbox data pick only for bool values
          data.values.push({
            field: this.column,
            value: this._filterData.values[0],
            expression: 'eq',
            type: 'boolean'
          });
        }
        break;

      case 'date':
        if ( this._filterData.values[0] ) {
          data.values.push({
            field: this.column,
            value: Date.parse(this._filterData.values[0]),
            expression: 'gt',
            type: 'timestamp'
          });
        }
        if ( this._filterData.values[1] ) {
          data.values.push({
            field: this.column,
            value: Date.parse(this._filterData.values[1]),
            expression: 'lt',
            type: 'timestamp'
          });
        }
        break;

      case 'number':
        if ( this._filterSearchText.length ) {
          // search field data
          data.values.push({
            field: this.column,
            value: this._filterSearchText,
            // expression: 'eq',
            // type: 'number'
          });
        }
        if ( this._filterData.values[0] ) {
          data.values.push({
            field: this.column,
            value: this._filterData.values[0],
            expression: 'gte',
            type: 'number'
          });
        }
        if ( this._filterData.values[1] ) {
          data.values.push({
            field: this.column,
            value: this._filterData.values[1],
            expression: 'lte',
            type: 'number'
          });
        }
        break;
    }

    if ( this._filterData.order ) {
      data.order = {
        by: this.column,
        order: this._filterData.order
      };
    }

    this.onFilter.emit(data);
  }

  cancelSearch() {
    this._filterSearchText = '';
    this._showSearch = !this._showSearch;
  }

  isActive(){
    this.active = !this.active;
  }

  sortAsc(){
    this.isActive();
    this._filterData.order = 'asc';
    this.name = 'A - Z'
  }

  sortDesc(){
    this.isActive();
    this._filterData.order = 'desc';
    this.name = 'Z - A'
  }

  noSort(){
    this.isActive();
    this._filterData.order = ''
    this.name = 'ORDER BY'
  }

  onCheckboxToggle({ value }) {
    this._filterData.values = _.xor(this._filterData.values, [value]);
  }

  onNumberRangeChange(value) {
    if (
      value === 'min'
      && this._filterData.values[0]
      && this._filterData.values[0] > this._filterData.values[1]
    ) {
      this._filterData.values[0] = this._filterData.values[1];
    }
    else if (
      value === 'max'
      && this._filterData.values[1]
      && this._filterData.values[0] > this._filterData.values[1]
    ) {
      this._filterData.values[1] = this._filterData.values[0];
    }
  }

  showInputSearch(): boolean {
    return this.type === 'text' || this.inputSearch;
  }

  public stopPropagation(e) {
    e.stopPropagation();
  }

  /**
   * If we have a rowData$ Observable, replace rowData items
   */
  getRowData$(): void {
    if(this.rowData$ && (typeof this.rowData$.subscribe == 'function')) {
      this.rowDataLoading = true;

      this.rowData$.subscribe(
        res => {
          if(!Array.isArray(res)) {
            return;
          }
          if(!Array.isArray(this.rowData)) {
            this.rowData = [];
          }   
          
          this.rowData.splice(0, this.rowData.length);
          this.rowData.push(...res);
          this.rowData.map(String); 

          this.rowDataLoading = false;
        }
      )
    }
  }
}
