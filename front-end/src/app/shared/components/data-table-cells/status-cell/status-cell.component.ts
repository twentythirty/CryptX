import { Component, OnInit, Input } from '@angular/core';
import { TableDataColumn } from '../../data-table/data-table.component';
import { ModelConstantsService } from '../../../../services/model-constants/model-constants.service';

export class StatusCellDataColumn extends TableDataColumn {
  component? = StatusCellComponent;
  inputs?: {
    value?: any;
    classMap?: (Function | { [key: string]: string });
  }
  outputs?: {

  }
  constructor(val: StatusCellDataColumn) {
    super(val);
  }
}

@Component({
  selector: 'app-status-cell',
  templateUrl: './status-cell.component.html',
  styleUrls: ['./status-cell.component.scss']
})
export class StatusCellComponent implements OnInit {

  @Input() value: any;
  @Input() classMap: (Function | { [key: string]: string });

  constructor(
    private modelConstants: ModelConstantsService,
  ) { }

  ngOnInit() {
  }

  public getStatusClass(value: any): string {
    value = '' + value;

    if(typeof this.classMap == 'function') {
      return this.classMap(value);
    } else if(this.classMap) {
      return this.classMap[value.toLowerCase()] || '';
    } else return '';
  }

  public getName(): string {
    return this.modelConstants.getName(this.value);
  }

}
