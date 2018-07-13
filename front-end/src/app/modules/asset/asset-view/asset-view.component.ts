import { Component, OnInit } from '@angular/core';
import { AssetService, AssetResultData } from '../../../services/asset/asset.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Asset, AssetStatus } from '../../../shared/models/asset';
import { AssetListComponent } from '../asset-list/asset-list.component';
import { AuthService } from '../../../services/auth/auth.service';

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
    protected router: Router
  ) {
    super(route, assetService, authService, router);
  }

  ngOnInit() {
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
            this.assetsDataSource.body = [res.assets];
            this.activityLog = res.status_changes
            this.count = 1;
          }
        )
      }
    )
  }

  public openRow(asset: Asset): void {
    // Override to do nothing
  }

}
