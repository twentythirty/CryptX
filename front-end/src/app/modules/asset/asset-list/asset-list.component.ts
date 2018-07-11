import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AssetService, AssetResultData, AssetsAllResponse } from '../../../services/asset/asset.service';
import { Asset, AssetStatusChanges, AssetStatus } from '../../../shared/models/asset';
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
  NumberCellDataColumn,
  ActionCellDataColumn,
  DataCellAction
} from '../../../shared/components/data-table-cells';
import { AuthService } from '../../../services/auth/auth.service';

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
    new DateCellDataColumn({ column: 'capitalisation_updated_timestamp' }),
    new ActionCellDataColumn({ column: null,
      inputs: {
        actions: [
          new DataCellAction({
            label: 'De-greylist',
            isShown: (row: any) => false && (row.is_greylisted === true),
            exec: (row: any) => { this.deGreylist(<Asset>row) }
          }),
          new DataCellAction({
            label: 'Blacklist',
            isShown: (row: any) => this.checkPerm(['CHANGE_ASSET_STATUS']) && (!row.is_blacklisted),
            exec: (row: any) => { this.blacklist(<Asset>row) }
          }),
          new DataCellAction({
            label: 'Whitelist',
            isShown: (row: any) => this.checkPerm(['CHANGE_ASSET_STATUS']) && (row.is_blacklisted),
            exec: (row: any) => { this.whitelist(<Asset>row) }
          })
        ]
      }
    })
  ];

  constructor(
    public route: ActivatedRoute,
    protected assetService: AssetService,
    protected authService: AuthService
  ) {
    super(route);
  }

  checkPerm (perm_code) {
    return this.authService.hasPermissions(perm_code);
  }

  getAllData(): void {
    this.assetService.getAllAssets(this.requestData).subscribe(
      (res: AssetsAllResponse) => {
        this.assetsDataSource.body = res.assets;
        // --- TODO: Remove this
        this.assetsDataSource.footer = this.assetsColumnsToShow.map(col => {
          let key = (typeof col == 'string') ? col : col.column;
          return '' + res.assets.reduce((prev, curr) => {
            return prev + Number(curr[key]);
          }, 0)
        })
        // ---
        this.count = res.count || res.assets.length;
      }
    )
  }

  /**
   * Actions
   */

  private deGreylist(asset: Asset): void {
    this.assetService.changeAssetStatus(
      asset.id,
      new AssetStatus(AssetStatusChanges.Graylisting, '')
    ).subscribe(
      res => {
        asset.is_greylisted = true;
      }
    )
  }

  private blacklist(asset: Asset): void {
    this.assetService.changeAssetStatus(
      asset.id,
      new AssetStatus(AssetStatusChanges.Blacklisting, '')
    ).subscribe(
      res => {
        asset.is_blacklisted = true;
      }
    )
  }

  private whitelist(asset: Asset): void {
    this.assetService.changeAssetStatus(
      asset.id,
      new AssetStatus(AssetStatusChanges.Whitelisting, '')
    ).subscribe(
      res => {
        asset.is_blacklisted = false;
      }
    )
  }

  /**
   * Styles
   */

  public rowBackgroundColor = (row: Asset): string => {
    if(row.is_blacklisted) return '#6b6b6b';
    if(row.is_greylisted) return '#aeaeae';
    return null;
  }

  public rowTexColor = (row: Asset): string => {
    if(row.is_blacklisted) return '#ffffff';
    if(row.is_greylisted) return '#f2f2f2';
    return null;
  }

}
