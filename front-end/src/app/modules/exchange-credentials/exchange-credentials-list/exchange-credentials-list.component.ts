import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-exchange-credentials-list',
  templateUrl: './exchange-credentials-list.component.html',
  styleUrls: ['./exchange-credentials-list.component.scss']
})
export class ExchangeCredentialsListComponent extends DataTableCommonManagerComponent implements OnInit {

  public exchangeCredentialsDataSource: TableDataSource = {
    header: [
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'api_key', nameKey: 'table.header.username', filter: { type: 'text', sortable: true } },
    ],
    body: null
  };

  public exchangeCredentialsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({column: 'api_key' }),
  ];

  constructor(
    public route: ActivatedRoute,
    protected exchangesService: ExchangesService,
    public router: Router,
  ) { super(route, router); }

  ngOnInit() {
    super.ngOnInit();
  }

  getAllData(): void {
    this.exchangesService.getAllExchangeCredentials(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.exchangeCredentialsDataSource, {
          body: res.exchange_credentials,
          footer: res.footer
        });
        this.count = res.count;
        this.getFilterLOV();
      }
    );
  }

  getFilterLOV(): void {
    this.exchangeCredentialsDataSource.header.filter(
      col => ['exchange'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.exchangesService.getCredentialsHeaderLOV(col.column);
      }
    );
  }

  openRow(exchangeCredentials): void {
    this.router.navigate(['/exchange_credentials/view/', exchangeCredentials.id]);
  }

}
