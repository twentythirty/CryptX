import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import _ from 'lodash';
import { FlatpickrOptions } from 'ng2-flatpickr';

export interface DataTableFilterData {
  column: string
  values: Array<{
    field: string
    value: any,
    expression: string
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
export class DataTableFilterComponent implements OnInit {
  private _filterData = {
    values: [],
    order: ''
  };
  private _showSearch: boolean = false;
  private _filterSearchText: string = '';
  private _datepickerOptions: FlatpickrOptions = {};

  @Input() column: string;
  @Input() type: string = 'text';
  @Input() sortable: boolean = true;
  @Input() rowData: Array<string> = [];

  @Output() onFilter = new EventEmitter<object>();

  constructor() {}

  ngOnInit() {}

  onFilterChange() {
    let data: DataTableFilterData = {
      column: this.column,
      values: [],
    };

    switch(this.type) {
      case 'text':
        if (this.rowData && this.rowData.length) {
          // checkbox data pick
          data.values.push({
            field: this.column,
            value: this._filterData.values,
            expression: 'in'
          });
        } else {
          // search field data
          data.values.push({
            field: this.column,
            value: `%${this._filterSearchText}%`,
            expression: 'iLike'
          });
        }
        break;

      case 'date':
        if ( this._filterData.values[0] ) {
          data.values[0] = {
            field: this.column,
            value: Date.parse(this._filterData.values[0]),
            expression: 'gt'
          };
        }
        if ( this._filterData.values[1] ) {
          data.values[1] = {
            field: this.column,
            value: Date.parse(this._filterData.values[1]),
            expression: 'lt'
          };
        }
        break;

      case 'number':
        if ( this._filterData.values[0] ) {
          data.values[0] = {
            field: this.column,
            value: this._filterData.values[0],
            expression: 'gte'
          };
        }
        if ( this._filterData.values[1] ) {
          data.values[1] = {
            field: this.column,
            value: this._filterData.values[1],
            expression: 'lte'
          };
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

  onCheckboxToggle({ value }) {
    this._filterData.values = _.xor(this._filterData.values, [value]);
  }

  onNumberRangeChange(value) {
    if ( value === 'min' && this._filterData.values[0] > this._filterData.values[1] ) {
      this._filterData.values[0] = this._filterData.values[1];
    }
    else if ( value === 'max' && this._filterData.values[0] > this._filterData.values[1] ) {
      this._filterData.values[1] = this._filterData.values[0];
    }
  }

}
