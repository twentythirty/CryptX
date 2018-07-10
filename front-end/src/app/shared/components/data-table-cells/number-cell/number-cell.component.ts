import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-number-cell',
  templateUrl: './number-cell.component.html',
  styleUrls: ['./number-cell.component.scss']
})
export class NumberCellComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit() {
  }

}
