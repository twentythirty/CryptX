import { Component, OnInit, Input, EventEmitter, Output, OnChanges, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { DataTableFilterType } from './data-table-filter-type.enum';

export interface DataTableFilterData {
  column: string;
  values: Array<{
    field: string
    value: any,
    expression?: string,
    type?: string
  }>;
  order?: {
    by: string
    order: string
  };
}

@Component({
  selector: 'app-data-table-filter',
  templateUrl: './data-table-filter.component.html',
  styleUrls: ['./data-table-filter.component.scss']
})
export class DataTableFilterComponent implements OnInit, OnChanges {
  filterData = {
    values: [],
    order: ''
  };
  showSearch = false;
  filterSearchText = '';

  active = false;
  rowDataLoading = false;

  picker1MaxDate: Date;
  picker2MinDate: Date;

  @Input() column: string;
  @Input() type: DataTableFilterType = DataTableFilterType.Text;
  @Input() sortable = true;
  @Input() hasRange = true;
  @Input() inputSearch;
  @Input() rowData: Array<{
    value: string | boolean | number,
    label?: string
  }> = [];

  @Input() rowData$: Observable<Array<{
    value: string | boolean | number,
    label?: string
  }>>;
  @Input() dirty: boolean;
  @Input() columnPosition: number;

  @Output() onFilter = new EventEmitter<object>();

  constructor() {}

  ngOnInit() {
    // setting default value
    this.hasRange = _.isUndefined(this.hasRange) ? true : this.hasRange;
  }

  ngOnChanges(changes) {
    // Runs when filter becomes dirty
    if (changes.dirty && !changes.dirty.previousValue && (changes.dirty.currentValue === true)) {
      this.rowData = [];
      this.getRowData$();
    }
  }

  onFilterChange() {
    const data: DataTableFilterData = {
      column: this.column,
      values: [],
    };

    switch (this.type) {
      case DataTableFilterType.Text:
        if (this.rowData && this.rowData.length && this.filterData.values.length) {
          // checkbox data pick
          data.values.push({
            field: this.column,
            value: this.filterData.values,
            expression: 'in',
            type: 'string'
          });
        } else if ( this.filterSearchText.length ) {
          // search field data
          data.values.push({
            field: this.column,
            value: `%${this.filterSearchText}%`,
            expression: 'iLike',
            type: 'string'
          });
        }
        break;

      case DataTableFilterType.Date:
        if ( this.filterData.values[0] ) {
          data.values.push({
            field: this.column,
            value: Date.parse(this.filterData.values[0]),
            expression: 'gt',
            type: 'timestamp'
          });
        }
        if ( this.filterData.values[1] ) {
          data.values.push({
            field: this.column,
            value: Date.parse(this.filterData.values[1]),
            expression: 'lt',
            type: 'timestamp'
          });
        }
        break;

      case DataTableFilterType.Number:
        if ( this.filterSearchText.length ) {
          // search field data
          data.values.push({
            field: this.column,
            value: this.filterSearchText,
          });
        }
        if ( _.isNumber(this.filterData.values[0]) ) {
          data.values.push({
            field: this.column,
            value: this.filterData.values[0],
            expression: 'gte',
            type: 'number'
          });
        }
        if ( _.isNumber(this.filterData.values[1]) ) {
          data.values.push({
            field: this.column,
            value: this.filterData.values[1],
            expression: 'lte',
            type: 'number'
          });
        }
        break;
    }

    if (this.filterData.order) {
      data.order = {
        by: this.column,
        order: this.filterData.order
      };
    }

    this.onFilter.emit(data);
  }

  cancelSearch() {
    this.filterSearchText = '';
    this.showSearch = !this.showSearch;
  }

  isActive() {
    this.active = !this.active;
  }

  sortAsc() {
    this.isActive();
    this.filterData.order = 'asc';
  }

  sortDesc() {
    this.isActive();
    this.filterData.order = 'desc';
  }

  noSort() {
    this.isActive();
    this.filterData.order = '';
  }

  onCheckboxToggle({ value }) {
    this.filterData.values = _.xor(this.filterData.values, [value]);
  }

  onNumberRangeChange(value): void {
    if (typeof this.filterData.values[0] !== 'number' || typeof this.filterData.values[1] !== 'number') {
      return;
    }

    if (
      value === 'min'
      && this.filterData.values[0] > this.filterData.values[1]
    ) {
      this.filterData.values[1] = this.filterData.values[0];
    } else if (
      value === 'max'
      && this.filterData.values[0] > this.filterData.values[1]
    ) {
      this.filterData.values[0] = this.filterData.values[1];
    }
  }

  showInputSearch(): boolean {
    if (typeof this.inputSearch !== 'undefined') {
      return this.inputSearch;
    }
    return this.type === DataTableFilterType.Text;
  }

  date1Change(event: MatDatepickerInputEvent<Date>) {
    this.picker2MinDate = event.value;
  }
  date2Change(event: MatDatepickerInputEvent<Date>) {
    this.picker1MaxDate = event.value;
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  /**
   * If we have a rowData$ Observable, replace rowData items
   */
  getRowData$(): void {
    if (this.rowData$ && (typeof this.rowData$.subscribe == 'function')) {
      this.rowDataLoading = true;

      this.rowData$.subscribe(
        res => {
          if (!Array.isArray(res)) {
            return;
          }
          if (!Array.isArray(this.rowData)) {
            this.rowData = [];
          }

          this.rowData.splice(0, this.rowData.length);
          this.rowData.push(...res);
          this.rowData.map(String);

          this.rowDataLoading = false;
        }
      );
    }
  }
}
