import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AssetService, AssetResultData, AssetsAllResponse } from '../../../services/asset/asset.service';
import { Asset } from '../../../shared/models/asset';
import { map } from 'rxjs/operator/map';
import { EntitiesFilter } from '../../../shared/models/api/entitiesFilter';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { ActivatedRoute } from '@angular/router';
import { PercentCellComponent } from '../../../shared/components/data-table-cells/percent-cell/percent-cell.component';
import { CurrencyCellComponent } from '../../../shared/components/data-table-cells/currency-cell/currency-cell.component';
import { BooleanCellComponent } from '../../../shared/components/data-table-cells/boolean-cell/boolean-cell.component';
import { DateCellComponent } from '../../../shared/components/data-table-cells/date-cell/date-cell.component';
import { NumberCellComponent } from '../../../shared/components/data-table-cells/number-cell/number-cell.component';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss']
})
export class AssetListComponent extends DataTableCommonManagerComponent implements OnInit {

  public assetsDataSource: TableDataSource = {
    header: [
      { column: 'symbol', name: 'Symbol', filter: { type: 'text', sortable: true } },
      { column: 'is_cryptocurrency', name: 'Cryptocurrency', filter: { type: 'text', sortable: true } },
      { column: 'long_name', name: 'Long name', filter: { type: 'text', sortable: true } },
      { column: 'is_base', name: 'Is base?', filter: { type: 'text', sortable: true } },
      { column: 'is_deposit', name: 'Is deposit?', filter: { type: 'text', sortable: true } },
      { column: 'capitalisation', name: 'Capitalisation', filter: { type: 'text', sortable: true } },
      { column: 'nvt_ratio', name: 'NVT ratio', filter: { type: 'text', sortable: true } },
      { column: 'market_share', name: 'Market share', filter: { type: 'text', sortable: true } },
      { column: 'capitalisation_updated_timestamp', name: 'Capitalisation updated', filter: { type: 'text', sortable: true } }
    ],
    body: []
  };

  public assetsColumnsToShow: Array<string | TableDataColumn> = [
    'symbol',
    { column: 'is_cryptocurrency', component: BooleanCellComponent },
    'long_name',
    { column: 'is_base', component: BooleanCellComponent },
    { column: 'is_deposit', component: BooleanCellComponent },
    { column: 'capitalisation', component: CurrencyCellComponent },
    { column: 'nvt_ratio', component: NumberCellComponent },
    { column: 'market_share', component: PercentCellComponent },
    { column: 'capitalisation_updated_timestamp', component: DateCellComponent }
  ];

  constructor(
    public route: ActivatedRoute,
    private assetService: AssetService
  ) {
    super(route);
  }

  getAllData(): void {
    this.assetService.getAllAssets(this.requestData).subscribe(
      (res: AssetsAllResponse) => {
        this.assetsDataSource.body = res.assets;
        this.count = res.count
      }
    )
  }

}
