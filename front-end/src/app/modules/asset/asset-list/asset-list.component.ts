import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AssetService, AssetResultData, AssetsAllResponse } from '../../../services/asset/asset.service';
import { Asset } from '../../../shared/models/asset';
import { map } from 'rxjs/operator/map';
import { EntitiesFilter } from '../../../shared/models/api/entitiesFilter';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { ActivatedRoute } from '@angular/router';
import {
  BooleanCellDataColumn,
  BooleanCellComponent,
  CurrencyCellDataColumn,
  CurrencyCellComponent,
  NumberCellComponent,
  PercentCellComponent,
  DateCellComponent,
  DateCellDataColumn,
  PercentCellDataColumn,
  NumberCellDataColumn
} from '../../../shared/components/data-table-cells';

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

  /**
   * Column config for data table
   * Every ...CellComponent has its ...CellDataColumn type class
   * Constructing it accepts an object of type ...CellDataColumn
   * This allows the compiler to type-check all inputs and outputs for a specific
   * component used. This config would be perfectly valid only by passing an object
   * that fits the type TableDataColumn, without constructing DataColumn classes, too.
   */
  public assetsColumnsToShow: Array<string | TableDataColumn> = [
    'symbol',
    new BooleanCellDataColumn({ column: 'is_cryptocurrency' }),
    'long_name',
    new BooleanCellDataColumn({ column: 'is_base' }),
    new BooleanCellDataColumn({ column: 'is_deposit' }),
    new CurrencyCellDataColumn({ column: 'capitalisation' }),
    new NumberCellDataColumn({ column: 'nvt_ratio' }),
    new PercentCellDataColumn({ column: 'market_share' }),
    new DateCellDataColumn({ column: 'capitalisation_updated_timestamp' })
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
        this.assetsDataSource.body = res.assets.map(
          asset => {
            return {
              capitalisation_updated_timestamp: Date.now(),
              capitalisation: 140256985548,
              is_cryptocurrency: true,
              is_greylisted: false,
              is_blacklisted: true,
              market_share: 37.7,
              nvt_ratio: 52.8,
              ...asset
            }
          }
        );
        this.count = res.count
      }
    )
  }

}
