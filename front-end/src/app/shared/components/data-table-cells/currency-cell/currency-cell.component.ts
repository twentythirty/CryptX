import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-currency-cell',
  templateUrl: './currency-cell.component.html',
  styleUrls: ['./currency-cell.component.scss']
})
export class CurrencyCellComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit() {
  }

}
