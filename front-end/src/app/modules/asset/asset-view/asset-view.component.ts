import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { AssetService, AssetResultData } from '../../../services/asset/asset.service';
import { Asset, AssetStatus } from '../../../shared/models/asset';
import { AssetListComponent } from '../asset-list/asset-list.component';
import { AuthService } from '../../../services/auth/auth.service';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';

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
    protected router: Router,
    protected currencyPipe: CurrencyPipe,
    private modelConstants: ModelConstantsService
  ) {
    super(route, assetService, authService, modelConstantsService, router, currencyPipe);
  }

  ngOnInit() {
    super.ngOnInit();
    
    this.getAsset();
  }

  private getAsset(): void {
    this.route.params.filter(
      (params: Params) => params.assetId
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
