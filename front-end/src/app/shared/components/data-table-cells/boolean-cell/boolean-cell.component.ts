import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class BooleanCellDataColumn extends TableDataColumn {
  inputs?: {
    value?: boolean;
  }
  outputs?: {

  }
  constructor(val: BooleanCellDataColumn) {
    super(val);
  }
}


@Component({
  selector: 'app-boolean-cell',
  templateUrl: './boolean-cell.component.html',
  styleUrls: ['./boolean-cell.component.scss']
})
export class BooleanCellComponent implements OnInit {

  @Input() value: boolean;

  constructor() { }

  ngOnInit() {
  }

}
