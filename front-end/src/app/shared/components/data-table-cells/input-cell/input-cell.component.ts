import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class InputCellDataColumn extends TableDataColumn {
  component? = InputCellComponent;
  inputs?: {
    value?: any;
    data?: any;
  }
  outputs?: {
    data?: any;
    dataDelayed?: any;
  }

  constructor(val: InputCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-input-cell',
  templateUrl: './input-cell.component.html',
  styleUrls: ['./input-cell.component.scss']
})
export class InputCellComponent implements OnInit {
  @Input() row: any;
  @Input() value: string;
  @Output('data') valueChange = new EventEmitter();
  @Output('dataDelayed') valueDelayedChange = new EventEmitter();

  @ViewChild('input') input: ElementRef;

  constructor() {}

  ngOnInit() {
    let input$ = Observable.fromEvent(this.input.nativeElement, 'keyup')
      .map((x: any) => x.target.value)
      .debounceTime(1000);

    input$.subscribe(val => {
      this.valueDelayedChange.emit({ value: val, row: this.row });
    });
  }

  onChange(val) {
    this.valueChange.emit({ value: val, row: this.row });
  }

}
