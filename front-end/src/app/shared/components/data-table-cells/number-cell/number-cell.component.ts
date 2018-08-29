import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class NumberCellDataColumn extends TableDataColumn {
  component? = NumberCellComponent;
  inputs?: {
    value?: boolean;
    suffix?: string;
    digitsInfo?: string;
    locale?: string;
  }
  outputs?: {

  }
  constructor(val: NumberCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-number-cell',
  templateUrl: './number-cell.component.html',
  styleUrls: ['./number-cell.component.scss']
})
export class NumberCellComponent implements OnInit {

  @Input() value: number;
  @Input() suffix: string;

  /**
   * Inputs specific to Angular DecimalPipe
   * Read more https://angular.io/api/common/DecimalPipe
   */
  @Input() digitsInfo: string = '1.2-2';
  @Input() locale: string;

  constructor() { }

  ngOnInit() {
  }

}
