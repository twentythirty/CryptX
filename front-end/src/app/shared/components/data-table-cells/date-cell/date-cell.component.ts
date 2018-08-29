import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class DateCellDataColumn extends TableDataColumn {
  component? = DateCellComponent;
  inputs?: {
    value?: boolean;
    format?: string;
    timezone?: string;
    locale?: string;
  }
  outputs?: {

  }
  constructor(val: DateCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-date-cell',
  templateUrl: './date-cell.component.html',
  styleUrls: ['./date-cell.component.scss']
})
export class DateCellComponent implements OnInit {

  @Input() value: any;

  /**
   * Inputs specific to Angular DatePipe
   * Read more https://angular.io/api/common/DatePipe
   */
  @Input() format: string = 'dd MMMM, yyyy hh:mm';
  @Input() timezone: string;
  @Input() locale: string;

  constructor() { }

  ngOnInit() {
  }

}
