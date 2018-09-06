import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs/observable/of';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { AssetModule } from '../asset.module';
import { AssetViewComponent } from './asset-view.component';
import { AssetService, AssetResultData } from '../../../services/asset/asset.service';
import { Asset } from '../../../shared/models/asset';


const AssetServiceStub = {
  getAsset: (assetId: number) => {
    return fakeAsyncResponse<AssetResultData>({
      success: true,
      asset: new Asset({
        id: assetId,
        symbol: 'LKY',
        is_cryptocurrency: 'assets.is_cryptocurrency.yes',
        long_name: 'Linkey',
        is_base: 'assets.is_base.no',
        is_deposit: 'assets.is_deposit.no',
        capitalization: '26479963',
        nvt_ratio: '253.3319396726087544',
        market_share: '0.011395714297227607',
        capitalization_updated: '2018-08-29T09:50:16.000Z',
        status: 'assets.status.400'
      }),
      history: [
        {
          asset_id: assetId,
          timestamp: '2018-08-24T06:42:42.342Z',
          user: {
            id: 7,
            name: 'Test User',
            email: 'test@domain.com'
          },
          comment: 'me likey linkey',
          type: 'assets.status.400'
        },
        {
          asset_id: assetId,
          timestamp: '2018-08-24T06:42:29.075Z',
          user: {
            id: 7,
            name: 'Test User',
            email: 'test@domain.com'
          },
          comment: 'me no likey linkey',
          type: 'assets.status.401'
        }
      ]
    });
  }
};


describe('AssetViewComponent', () => {
  let component: AssetViewComponent;
  let fixture: ComponentFixture<AssetViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AssetModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: AssetService, useValue: AssetServiceStub },
        {
          provide: ActivatedRoute, useValue: {
            params: of({ assetId: 1 })
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load asset on init', () => {
    AssetServiceStub.getAsset(1).subscribe(res => {
      expect(component.assetsDataSource.body).toEqual([res.asset]);
      expect(component.count).toEqual(component.count);
    });
  });

  it('should show activity log', () => {
    expect(fixture.nativeElement.querySelector('app-action-log')).not.toBe(undefined);
  });

});
