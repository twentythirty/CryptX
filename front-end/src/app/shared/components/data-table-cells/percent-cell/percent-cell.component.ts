import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-percent-cell',
  templateUrl: './percent-cell.component.html',
  styleUrls: ['./percent-cell.component.scss']
})
export class PercentCellComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit() {
  }

}
