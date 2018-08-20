import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';

import { InvestmentService } from '../../../services/investment/investment.service';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { DateCellDataColumn, StatusCellDataColumn } from '../../../shared/components/data-table-cells';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends DataTableCommonManagerComponent implements OnInit {

  public showNewInvestmentModal: boolean = false;

  public investmentsDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'started_timestamp', nameKey: 'table.header.creation_time', filter: { type: 'date', sortable: true } },
      { column: 'updated_timestamp', nameKey: 'table.header.updated', filter: { type: 'date', sortable: true } },
      { column: 'completed_timestamp', nameKey: 'table.header.completion_time', filter: { type: 'date', sortable: true } },
      { column: 'user_created', nameKey: 'table.header.creator', filter: { type: 'text', sortable: true } },
      { column: 'strategy_type', nameKey: 'table.header.portfolio', filter: { type: 'text', sortable: true } },
      { column: 'is_simulated', nameKey: 'table.header.simulated', filter: { type: 'text', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
    ],
    body: null
  };

  public investmentsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new DateCellDataColumn({ column: 'started_timestamp' }),
    new DateCellDataColumn({ column: 'updated_timestamp' }),
    new DateCellDataColumn({ column: 'completed_timestamp' }),
    new TableDataColumn({ column: 'user_created' }),
    new StatusCellDataColumn({ column: 'strategy_type' }),
    new StatusCellDataColumn({ column: 'is_simulated' }),
    new StatusCellDataColumn({ column: 'status' }),
  ];

  constructor(
    private investmentService: InvestmentService,
    public route: ActivatedRoute,
    private router: Router
  ) {
    super(route);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }


  getAllData() {
    this.investmentService.getAllInvestments(this.requestData)
    .finally(() => this.stopTableLoading())
    .subscribe(
      res => {
        Object.assign(this.investmentsDataSource, {
          body: res.investment_runs,
          footer: res.footer
        });
        this.count = res.count;
      }
    );
  }

  /**
   * Add a rowData$ Observable to text and boolean column filters
   */
  getFilterLOV(): void {
    this.investmentsDataSource.header.filter(
      col => ['strategy_type', 'is_simulated', 'status'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.investmentService.getAllInvestmentsHeaderLOV(col.column);
      }
    )
  }

  openRow(investment: any): void {
    this.router.navigate(['/run/investment', investment.id]);
  }

  closeNewInvestmentModal() {
    this.showNewInvestmentModal = false;
  }

}
