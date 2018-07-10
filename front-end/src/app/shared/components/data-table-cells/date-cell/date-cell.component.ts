import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-date-cell',
  templateUrl: './date-cell.component.html',
  styleUrls: ['./date-cell.component.scss']
})
export class DateCellComponent implements OnInit {

  @Input() value: any;

  constructor() { }

  ngOnInit() {
  }

}
