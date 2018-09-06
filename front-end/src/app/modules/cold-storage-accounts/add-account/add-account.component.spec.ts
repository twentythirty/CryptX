import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { ColdStorageAccountsModule } from '../cold-storage-accounts.module';
import { AddAccountComponent } from './add-account.component';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { AssetService, AssetsAllResponseDetailed } from '../../../services/asset/asset.service';
import { ColdStorageService, CustodiansAllResponse } from '../../../services/cold-storage/cold-storage.service';


const ModelConstantServiceStub = {
  getGroup: () => {
    return fakeAsyncResponse({
      STRATEGY_TYPES: {
        MCI: 101,
        LCI: 102
      }
    });
  }
};

const AssetServiceStub = {
  getAllAssetsDetailed: () => {
    return fakeAsyncResponse<AssetsAllResponseDetailed>({
      success: true,
      assets: [
        {
          id: 2,
          symbol: 'BTC',
          is_cryptocurrency: 'assets.is_cryptocurrency.yes',
          long_name: 'Bitcoin',
          is_base: 'assets.is_base.yes',
          is_deposit: 'assets.is_deposit.no',
          capitalization: '118312061603',
          nvt_ratio: '30.4819604800685651',
          market_share: '53.399284579574',
          capitalization_updated: '2018-08-30T13:49:51.000Z',
          status: 'assets.status.400'
        },
      ],
      footer: [],
      count: 1
    });
  }
};

const ColdStorageServiceStub = {
  getAllCustodians: () => {
    return fakeAsyncResponse<CustodiansAllResponse>({
      success: true,
      custodians: [
        {
          id: 1,
          name: 'Coinbase Custody'
        }
      ],
      footer: [],
      count: 1
    });
  }
};


describe('AddAccountComponent', () => {
  let component: AddAccountComponent;
  let fixture: ComponentFixture<AddAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageAccountsModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ModelConstantsService, useValue: ModelConstantServiceStub },
        { provide: AssetService, useValue: AssetServiceStub },
        { provide: ColdStorageService, useValue: ColdStorageServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
