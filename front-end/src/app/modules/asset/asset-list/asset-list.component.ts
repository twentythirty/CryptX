import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import _ from 'lodash';

import { AssetService, AssetsAllResponseDetailed } from '../../../services/asset/asset.service';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import {
  CurrencyCellDataColumn,
  DateCellDataColumn,
  PercentCellDataColumn,
  NumberCellDataColumn,
  ActionCellDataColumn,
  DataCellAction,
  StatusCellDataColumn
} from '../../../shared/components/data-table-cells';
import { AuthService } from '../../../services/auth/auth.service';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { Asset, AssetStatus } from '../../../shared/models/asset';
import { StatusClass } from '../../../shared/models/common';

const INSTRUMENT_STATUS_CHANGES = 'INSTRUMENT_STATUS_CHANGES';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss']
})
export class AssetListComponent extends DataTableCommonManagerComponent implements OnInit {

  public assetsDataSource: TableDataSource = {
    header: [
      { column: 'symbol', nameKey: 'table.header.symbol', filter: { type: 'text', sortable: true } },
      { column: 'is_cryptocurrency', nameKey: 'table.header.crypto', filter: { type: 'text', sortable: true } },
      { column: 'long_name', nameKey: 'table.header.long_name', filter: { type: 'text', sortable: true } },
      { column: 'is_base', nameKey: 'table.header.base', filter: { type: 'text', sortable: true } },
      { column: 'is_deposit', nameKey: 'table.header.deposit', filter: { type: 'text', sortable: true } },
      { column: 'capitalization', nameKey: 'table.header.capitalisation', filter: { type: 'number', sortable: true } },
      { column: 'nvt_ratio', nameKey: 'table.header.nvt_ratio', filter: { type: 'number', sortable: true } },
      { column: 'market_share', nameKey: 'table.header.market_share', filter: { type: 'number', sortable: true } },
      { column: 'capitalization_updated', nameKey: 'table.header.capitalisation_updated', filter: { type: 'date', sortable: true } },
      { column: 'status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
      { column: '', nameKey: 'table.header.actions' }
    ],
    body: null
  };

  /**
   * Column config for data table
   * Every ...CellComponent has its ...CellDataColumn type class
   * Constructing it accepts an object of type ...CellDataColumn
   * This allows the compiler to type-check all inputs and outputs for a specific
   * component used. This config would be perfectly valid only by passing an object
   * that fits the type TableDataColumn, without constructing DataColumn classes, too.
   */
  public assetsColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'symbol' }),
    new StatusCellDataColumn({ column: 'is_cryptocurrency' }),
    new TableDataColumn({ column: 'long_name' }),
    new StatusCellDataColumn({ column: 'is_base' }),
    new StatusCellDataColumn({ column: 'is_deposit' }),
    new CurrencyCellDataColumn({ column: 'capitalization' }),
    new NumberCellDataColumn({ column: 'nvt_ratio' }),
    new PercentCellDataColumn({ column: 'market_share' }),
    new DateCellDataColumn({ column: 'capitalization_updated' }),
    new StatusCellDataColumn({ column: 'status', inputs: { classMap: value => {
      return StatusClass.DEFAULT;
    }}}),
    new ActionCellDataColumn({ column: null,
      inputs: {
        actions: [
          new DataCellAction({
            label: 'De-greylist',
            isShown: (row: any) => this.checkPerm(['CHANGE_ASSET_STATUS']) && row.statusCode === 402,
            exec: (row: any) => { this.deGreylist(<Asset>row) }
          }),
          new DataCellAction({
            label: 'Blacklist',
            isShown: (row: any) => this.checkPerm(['CHANGE_ASSET_STATUS']) && row.statusCode === 400,
            exec: (row: any) => { this.blacklist(<Asset>row) }
          }),
          new DataCellAction({
            label: 'Whitelist',
            isShown: (row: any) => this.checkPerm(['CHANGE_ASSET_STATUS']) && row.statusCode === 401,
            exec: (row: any) => { this.whitelist(<Asset>row) }
          })
        ]
      }
    })
  ];

  constructor(
    public route: ActivatedRoute,
    protected assetService: AssetService,
    protected authService: AuthService,
    protected modelConstantsService: ModelConstantsService,
    public router: Router,
    protected currencyPipe: CurrencyPipe,
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  checkPerm (perm_code) {
    return this.authService.hasPermissions(perm_code);
  }

  getAllData(): void {
    this.assetService.getAllAssetsDetailed(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      (res: AssetsAllResponseDetailed) => {
        Object.assign(this.assetsDataSource, {
          body: res.assets,
          footer: res.footer.map(item => {
            if( item.name === 'capitalization' ) {
              item.args = _.mapValues(item.args, val => this.currencyPipe.transform(val, 'USD', 'symbol', '1.0-0'));
            }
            return item;
          })
        });
        this.count = res.count || res.assets.length;
      }
    );
  }

  /**
   * Add a rowData$ Observable to text and boolean column filters
   */
  getFilterLOV(): void {
    this.assetsDataSource.header.filter(
      col => ['is_base', 'is_deposit', 'status'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.assetService.getHeaderLOV(col.column)
      }
    );
  }

  public openRow(asset: Asset): void {
    this.router.navigate(['/assets/view', asset.id]);
  }

  /**
   * Clicks
   */

  public deGreylist(asset: Asset): void {
    this.showRationaleModal(asset, data => data && this.doDeGreylist(data));
  }

  public blacklist(asset: Asset): void {
    this.showRationaleModal(asset, data => data && this.doBlacklist(data));
  }

  public whitelist(asset: Asset): void {
    this.showRationaleModal(asset, data => data && this.doWhitelist(data));
  }


  /**
   * Actions
   */
  
  public doDeGreylist({ rationale, data }): void {
    let asset: Asset = data;

    this.assetService.changeAssetStatus(
      asset.id,
      new AssetStatus(this.modelConstantsService.getGroup(INSTRUMENT_STATUS_CHANGES)['Whitelisting'], rationale)
    ).subscribe(
      res => {
        asset.status = 'assets.status.400';
        asset.statusCode = 400;

        this.getAsset();
      }
    );
  }

  public doBlacklist({ rationale, data }): void {
    let asset: Asset = data;

    this.assetService.changeAssetStatus(
      asset.id,
      new AssetStatus(this.modelConstantsService.getGroup(INSTRUMENT_STATUS_CHANGES)['Blacklisting'], rationale)
    ).subscribe(
      res => {
        asset.status = 'assets.status.401';
        asset.statusCode = 401;

        this.getAsset();
      }
    );
  }

  public doWhitelist({ rationale, data }): void {
    let asset: Asset = data;

    this.assetService.changeAssetStatus(
      asset.id,
      new AssetStatus(this.modelConstantsService.getGroup(INSTRUMENT_STATUS_CHANGES)['Whitelisting'], rationale)
    ).subscribe(
      res => {
        asset.status = 'assets.status.400';
        asset.statusCode = 400;

        this.getAsset();
      }
    );
  }

  /**
   * Styles
   */

  public rowClass(row: Asset): string {
    if(row.statusCode == 401) return 'color-black';
    if(row.statusCode == 402) return 'color-gray';
    return '';
  }

  /**
   * Rationale
   */

  public rationaleModelIsShown: boolean = false;
  public rationaleData: any;
  public rationaleDone: (data: any) => void;

  public showRationaleModal(data: any, done?: (data: any) => void): void {
    this.rationaleModelIsShown = true;
    this.rationaleData = data;
    this.rationaleDone = done;
  }

  public hideRationaleModal(): void {
    this.rationaleModelIsShown = false;
    this.rationaleData = null;
    this.rationaleDone = null;
  }

  public submitRationale(data): void {
    if(typeof this.rationaleDone == 'function') {
      this.rationaleDone(data);
    }
    this.hideRationaleModal();
  }

  //Virtual method to call inside the View to update the activity log.
  public getAsset(): void {};

}
