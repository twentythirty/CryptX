import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AssetService, AssetResultData } from '../../../services/asset/asset.service';
import { Asset, AssetStatus } from '../../../shared/models/asset';
import { AssetListComponent } from '../asset-list/asset-list.component';
import { AuthService } from '../../../services/auth/auth.service';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { TableDataSource } from "../../../shared/components/data-table/data-table.component";

@Component({
  selector: 'app-asset-view',
  templateUrl: './asset-view.component.html',
  styleUrls: ['./asset-view.component.scss']
})
export class AssetViewComponent extends AssetListComponent implements OnInit {

  public assetId: number;
  public asset: Asset;
  public activityLog: Array<AssetStatus>;

  constructor(
    public route: ActivatedRoute,
    protected assetService: AssetService,
    protected authService: AuthService,
    protected modelConstantsService: ModelConstantsService,
    public router: Router,
    protected currencyPipe: CurrencyPipe,
    private modelConstants: ModelConstantsService
  ) {
    super(route, assetService, authService, modelConstantsService, router, currencyPipe);
  }

  public assetsDataSource: TableDataSource = {
    header: [
      { column: 'symbol', nameKey: 'table.header.symbol'},
      { column: 'is_cryptocurrency', nameKey: 'table.header.crypto'},
      { column: 'long_name', nameKey: 'table.header.long_name'},
      { column: 'is_base', nameKey: 'table.header.base'},
      { column: 'is_deposit', nameKey: 'table.header.deposit'},
      { column: 'capitalization', nameKey: 'table.header.capitalisation'},
      { column: 'nvt_ratio', nameKey: 'table.header.nvt_ratio'},
      { column: 'market_share', nameKey: 'table.header.market_share'},
      { column: 'capitalization_updated', nameKey: 'table.header.capitalisation_updated'},
      { column: 'status', nameKey: 'table.header.status'},
      { column: '', nameKey: 'table.header.actions' }
    ],
    body: null
  };

  ngOnInit() {
    this.getAsset();
  }

  public getAsset(): void {
    this.route.params.pipe(
      filter((params: Params) => params.assetId)
    ).subscribe(
      (params: Params) => {
        this.assetId = params.assetId;
        this.assetService.getAsset(this.assetId).subscribe(
          (res: AssetResultData) => {
            this.assetsDataSource.body = [res.asset];
            this.activityLog = res.history;
            this.count = 1;
          }
        )
      }
    )
  }

  public openRow(asset: Asset): void {
    // Override to do nothing
  }

  public getType(type: number): string {
    return this.modelConstants.getName(type)
  }

}
