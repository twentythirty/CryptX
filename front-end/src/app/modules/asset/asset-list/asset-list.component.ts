import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AssetService, AssetResultData, AssetsAllResponse } from '../../../services/asset/asset.service';
import { Asset } from '../../../shared/models/asset';
import { map } from 'rxjs/operator/map';
import { EntitiesFilter } from '../../../shared/models/api/entitiesFilter';
import { TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { ActivatedRoute } from '@angular/router';

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
  assetsColumnsToShow = [
    'symbol',
    'is_cryptocurrency',
    'long_name',
    'is_base',
    'is_deposit',
    'capitalisation',
    'nvt_ratio',
    'market_share',
    'capitalisation_updated_timestamp',
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
