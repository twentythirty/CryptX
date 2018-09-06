import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { AssetModule } from '../asset.module';
import { AssetListComponent } from './asset-list.component';
import { AssetService, AssetsAllResponseDetailed } from '../../../services/asset/asset.service';
import { Asset } from '../../../shared/models/asset';


const AssetServiceStub = {
  getAllAssetsDetailed: () => {
    return fakeAsyncResponse<AssetsAllResponseDetailed>({
      success: true,
      assets: [
        new Asset({
          id: 1978,
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
        new Asset({
          id: 1979,
          symbol: 'LKY',
          is_cryptocurrency: 'assets.is_cryptocurrency.yes',
          long_name: 'Linkey',
          is_base: 'assets.is_base.no',
          is_deposit: 'assets.is_deposit.no',
          capitalization: '26479963',
          nvt_ratio: '253.3319396726087544',
          market_share: '0.011395714297227607',
          capitalization_updated: '2018-08-29T09:50:16.000Z',
          status: 'assets.status.401'
        }),
      ],
      footer: [
        {
          name: 'is_base',
          value: '2',
          template: 'assets.footer.is_base',
          args: { is_base: '2' }
        },
        {
          name: 'is_deposit',
          value: '1',
          template: 'assets.footer.is_deposit',
          args: { is_deposit: '1' }
        },
      ],
      count: 2
    });
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('AssetListComponent', () => {
  let component: AssetListComponent;
  let fixture: ComponentFixture<AssetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AssetModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: AssetService, useValue: AssetServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load assets on init', () => {
    AssetServiceStub.getAllAssetsDetailed().subscribe(res => {
      expect(component.assetsDataSource.body).toEqual(res.assets);
      expect(component.assetsDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });
});
