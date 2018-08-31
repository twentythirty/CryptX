import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class SelectCellDataColumn extends TableDataColumn {
  component? = SelectCellComponent;
  inputs?: {
    value?: any;
    data?: any;
    fieldType?: string,
    placeholder?: string,
    small?: boolean,
    items: (row: any) => Array<{id: number, value: string}>;
    isDisabled?: (row: any) => boolean;
    selectedValue?: (row: any) => object;
  }
  outputs?: {
    valueChange?: any;
  }
  constructor(val: SelectCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-select-cell',
  templateUrl: './select-cell.component.html',
  styleUrls: ['./select-cell.component.scss']
})
export class SelectCellComponent implements OnInit {
  @Input() row: any;
  @Input() value: string;
  @Input() placeholder: string;
  @Input() fieldtype: string;
  @Input() small: boolean;
  @Input() data: any;
  @Input() items: (row: any) => void = (row) => null;
  @Input() isDisabled?: (row: any) => boolean = (row) => false;
  @Input() selectedValue?: (row: any) => void = (row) => null;
  
  @Output() valueChange = new EventEmitter();

  disabled: boolean = true;
  dropDownList: any = [];
  selected: any = {};

  constructor() { }

  ngOnInit() {
    this.disabled = this.isDisabled(this.row);
    this.dropDownList = this.items(this.row);
    this.selected = this.selectedValue(this.row);
  }

  onChange(val) {
    this.valueChange.emit({ value: val.id, row: this.row });
  }

  openDropDown(){
    this.dropDownList = this.items(this.row);
  }
}
