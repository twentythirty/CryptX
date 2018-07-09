import { Component, OnInit } from '@angular/core';
import { AssetService, AssetResultData } from '../../../services/asset/asset.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Asset } from '../../../shared/models/asset';

@Component({
  selector: 'app-asset-view',
  templateUrl: './asset-view.component.html',
  styleUrls: ['./asset-view.component.scss']
})
export class AssetViewComponent implements OnInit {

  public assetId: number;
  public asset: Asset;

  constructor(
    private assetService: AssetService,
    private route: ActivatedRoute
  ) { }

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
            this.asset = res.asset;
          }
        )
      }
    )
  }

}
