import { Component, OnInit } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class ActionCellDataColumn extends TableDataColumn {
  inputs?: {
    value?: boolean;
  }
  outputs?: {

  }
  constructor(val: ActionCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-action-cell',
  templateUrl: './action-cell.component.html',
  styleUrls: ['./action-cell.component.scss']
})
export class ActionCellComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
