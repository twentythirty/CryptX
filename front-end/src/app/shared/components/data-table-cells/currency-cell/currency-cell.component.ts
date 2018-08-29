import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';

export class CurrencyCellDataColumn extends TableDataColumn {
  component? = CurrencyCellComponent;
  inputs?: {
    value?: boolean;
    currencyCode?: string;
    display?: string;
    digitsInfo?: string;
    locale?: string;
  }
  outputs?: {

  }
  constructor(val: CurrencyCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-currency-cell',
  templateUrl: './currency-cell.component.html',
  styleUrls: ['./currency-cell.component.scss']
})
export class CurrencyCellComponent implements OnInit {

  @Input() value: number;

  /**
   * Inputs specific to Angular CurrencyPipe
   * Read more https://angular.io/api/common/CurrencyPipe
   */
  @Input() currencyCode: string = 'USD';
  @Input() display: string = 'symbol';
  @Input() digitsInfo: string = '1.0-0';
  @Input() locale: string;

  constructor() { }

  ngOnInit() {
  }

}
