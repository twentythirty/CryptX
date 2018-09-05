import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';

import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { Instrument } from '../../../shared/models/instrument';

@Component({
  selector: 'app-instrument-list',
  templateUrl: './instrument-list.component.html',
  styleUrls: ['./instrument-list.component.scss']
})
export class InstrumentListComponent extends DataTableCommonManagerComponent {
  public instrumentsDataSource: TableDataSource = {
    header: [
      { column: 'symbol', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true }},
      { column: 'exchanges_connected', nameKey: 'table.header.exchanges_connected', filter: { type: 'number', sortable: true }},
      { column: 'exchanges_failed', nameKey: 'table.header.exchanges_failed', filter: { type: 'number', sortable: true }},
    ],
    body: null
  };

  public instrumentsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'symbol' }),
    new TableDataColumn({ column: 'exchanges_connected' }),
    new TableDataColumn({ column: 'exchanges_failed' }),
  ];


  constructor(
    public route: ActivatedRoute,
    public instrumentsService: InstrumentsService,
    public router: Router,
  ) {
    super(route, router);
  }

  /**
   * Add a rowData$ Observable to text and boolean column filters
   */
  private getFilterLOV(): void {
    this.instrumentsDataSource.header.filter(
      col => ['symbol'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.instrumentsService.getHeaderLOV(col.column);
      }
    )
  }

  public openRow(instrument: Instrument): void {
    this.router.navigate(['/instrument', instrument.id]);
  }

  getAllData(): void {
    this.instrumentsService.getAllInstruments(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      data => {
        Object.assign(this.instrumentsDataSource, {
          body: data.instruments,
          footer: data.footer
        });
        this.count = data.count;
        this.getFilterLOV();
      },
      err => {
        console.log(err);
      }
    );
  }

}
