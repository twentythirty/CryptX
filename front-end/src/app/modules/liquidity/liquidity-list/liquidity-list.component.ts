import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { NumberCellDataColumn } from '../../../shared/components/data-table-cells';
import { LiquidityRequirement } from '../../../shared/models/liquidityRequirement';

import { LiquidityService } from '../../../services/liquidity/liquidity.service';

@Component({
  selector: 'app-liquidity-list',
  templateUrl: './liquidity-list.component.html',
  styleUrls: ['./liquidity-list.component.scss']
})
export class LiquidityListComponent extends DataTableCommonManagerComponent implements OnInit {
  public liquidityDataSource: TableDataSource = {
    header: [
      { column: 'instrument', nameKey: 'table.header.instrument', filter: { type: 'text', sortable: true } },
      { column: 'periodicity', nameKey: 'table.header.periodicity', filter: { type: 'number', sortable: true } },
      { column: 'quote_asset', nameKey: 'table.header.quote_asset', filter: { type: 'text', sortable: true } },
      { column: 'minimum_circulation', nameKey: 'table.header.minimum_circulation', filter: { type: 'number', sortable: true } },
      { column: 'exchange', nameKey: 'table.header.exchange', filter: { type: 'text', sortable: true } },
      { column: 'exchange_count', nameKey: 'table.header.exchange_count', filter: { type: 'number', sortable: true } },
      { column: 'exchange_not_pass', nameKey: 'table.header.exchange_not_pass', filter: { type: 'number', sortable: true } },
    ],
    body: null,
  };

  public liquidityColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'instrument' }),
    new TableDataColumn({ column: 'periodicity' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new NumberCellDataColumn({ column: 'minimum_circulation' }),
    new TableDataColumn({ column: 'exchange_count' }),
    new TableDataColumn({ column: 'exchange' }),
    new TableDataColumn({ column: 'exchange_not_pass' }),
  ];

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private liquidityService: LiquidityService,
  ) {
    super(route);
    this.getFilterLOV();
  }

  /**
   * Add a rowData$ Observable to text and boolean column filters
  */
  private getFilterLOV(): void {
    this.liquidityDataSource.header.filter(
      col => ['instrument', 'quote_asset', 'exchange'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.liquidityService.getHeaderLOV(col.column);
      }
    )
  }

  
  getAllData(): void {
    this.liquidityService.getAllLiquidities(this.requestData).subscribe(
      res => {
        Object.assign(this.liquidityDataSource, {
          body: res.liquidity_requirements,
          footer: res.footer
        });
        this.count = res.count;
      }
    );
  }

  openRow(liquidity: LiquidityRequirement): void {
    this.router.navigate(['/liquidity_requirements/preview', liquidity.id])
  }

}
