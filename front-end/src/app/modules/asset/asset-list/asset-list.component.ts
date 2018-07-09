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
      { column: 'name', name: 'Role name', filter: { type: 'text', sortable: true } }
    ],
    body: []
  };
  assetsColumnsToShow = ['name'];

  constructor(
    public route: ActivatedRoute,
    private assetService: AssetService
  ) {
    super(route);
  }

  getAllData(): void {
    this.assetService.getAllAssets().subscribe(
      (res: AssetsAllResponse) => {
        this.assetsDataSource.body = res.assets;
        this.count = res.count
      }
    )
  }

  ngOnInit() {
  }

}
