import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class SelectCellDataColumn extends TableDataColumn {
  component? = SelectCellComponent;
  inputs?: {
    value?: any;
    data?: any;
    items: (row: any) => Array<{id: number, value: string}>;
    isDisabled?: (row: any) => boolean;
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
  @Input() items: (row: any) => void = (row) => null;
  @Input() isDisabled?: (row: any) => boolean = (row) => false;
  
  @Output() valueChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onChange(val) {
    this.valueChange.emit({ value: val, row: this.row });
  }

}
