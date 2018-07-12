import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class ConfirmCellDataColumn extends TableDataColumn {
  component? = ConfirmCellComponent;
  inputs?: {
    value?: boolean;
    row?: any;
    execConfirm?: (row: any) => void,
    execDecline?: (row: any) => void
  }
  outputs?: {

  }
  constructor(val: ConfirmCellDataColumn) {
    super(val);
  }
}
@Component({
  selector: 'app-confirm-cell',
  templateUrl: './confirm-cell.component.html',
  styleUrls: ['./confirm-cell.component.scss']
})
export class ConfirmCellComponent implements OnInit {

  @Input() value?: boolean;
  @Input() row?: any;
  @Input() execConfirm?: (row: any) => void = (row) => null;
  @Input() execDecline?: (row: any) => void = (row) => null;

  constructor() { }

  ngOnInit() {
  }

}
