import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class DataCellAction {
  label: string;
  className?: string;
  exec: (row: any) => void;
  loading?: (row: any) => boolean = (row) => false;
  isShown?: (row: any) => boolean = (row) => true;

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
