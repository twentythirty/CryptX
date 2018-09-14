declare function require(path: string);

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class DataCellAction {
  label: string;
  isShown?: (row: any) => boolean = (row) => true;
  exec: (row: any) => void;

  constructor(val: DataCellAction) {
    Object.assign(this, val);
  }
}

export class ActionCellDataColumn extends TableDataColumn {
  component ? = ActionCellComponent;
  inputs?: {
    value?: boolean;
    row?: any;
    actions?: Array<DataCellAction>
  };
  outputs?: {

  };
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
  image = require('Images/action-true.svg');

  @Input() value: any;
  @Input() row: any;

  @Input() actions: Array<DataCellAction> = [];

  constructor() { }

  ngOnInit() {
  }

  public doAction(action: DataCellAction, ev?: MouseEvent): void {
    if (ev.stopPropagation) {
      ev.stopPropagation();
    }
    action.exec(this.row);
  }

}
