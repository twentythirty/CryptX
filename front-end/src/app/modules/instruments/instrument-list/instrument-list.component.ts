import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';

import { InstrumentsService } from '../../../services/instruments/instruments.service';

@Component({
  selector: 'app-instrument-list',
  templateUrl: './instrument-list.component.html',
  styleUrls: ['./instrument-list.component.scss']
})
export class InstrumentListComponent extends DataTableCommonManagerComponent {
  public instrumentsDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', sortable: true }},
      { column: 'exchanges_connected', nameKey: 'table.header.exchanges_connected', filter: { type: 'number', sortable: true }},
      { column: 'exchanges_failed', nameKey: 'table.header.exchanges_connected', filter: { type: 'number', sortable: true }},
    ],
    body: [],
  };

  public instrumentsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'exchanges_connected' }),
    new TableDataColumn({ column: 'exchanges_failed' }),
  ];


  constructor(
    public route: ActivatedRoute,
    public instrumentsService: InstrumentsService,
  ) {
    super(route);
  }

  openRow(): void {

  }

  getAllData(): void {
    this.instrumentsService.getAllInstruments(this.requestData).subscribe(
      data => {
        this.instrumentsDataSource.body = data.instruments;
        this.count = data.count;

        if (data.footer) {
          this.instrumentsDataSource.footer = data.footer;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

}
