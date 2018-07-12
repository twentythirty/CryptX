import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class PercentCellDataColumn extends TableDataColumn {
  component? = PercentCellComponent;
  inputs?: {
    value?: boolean;
    digitsInfo?: string;
    locale?: string;
    multiplier?: number;
  }
  outputs?: {

  }
  constructor(val: PercentCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-percent-cell',
  templateUrl: './percent-cell.component.html',
  styleUrls: ['./percent-cell.component.scss']
})
export class PercentCellComponent implements OnInit {

  @Input() value: number;

  /**
   * Inputs specific to Angular PercentPipe
   * Read more https://angular.io/api/common/PercentPipe
   */
  @Input() digitsInfo: string = '2.2-2';
  @Input() locale: string;

  @Input() multiplier: number = 0.01;

  constructor() { }

  ngOnInit() {
  }

}
