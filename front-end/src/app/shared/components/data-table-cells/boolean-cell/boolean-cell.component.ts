import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class BooleanCellDataColumn extends TableDataColumn {
  component? = BooleanCellComponent;
  inputs?: {
    value?: boolean;
    yesText?: string;
    noText?: string;
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
  @Input() yesText: string = 'Yes';
  @Input() noText: string = 'No';

  constructor() { }

  ngOnInit() {
  }

  public displayValue(): string {
    if(this.value === true) return this.yesText;
    if(this.value === false) return this.noText;
    return '-';
  }

}
