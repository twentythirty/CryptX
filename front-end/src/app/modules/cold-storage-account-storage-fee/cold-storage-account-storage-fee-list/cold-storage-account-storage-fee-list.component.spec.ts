import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { ColdStorageAccountStorageFeeModule } from '../cold-storage-account-storage-fee.module';
import { ColdStorageAccountStorageFeeListComponent } from './cold-storage-account-storage-fee-list.component';
import { ColdStorageService, StorageFeesAllResponse } from '../../../services/cold-storage/cold-storage.service';


const ColdStorageServiceStub = {
  getAllStorageFees: () => {
    return fakeAsyncResponse<StorageFeesAllResponse>({
      success: true,
      fees: [
        {
          id: 0,
          creation_timestamp: 1535639411415,
          amount: 15.405537845206743,
          asset: "XPX",
          cold_storage_account_id: 59,
          custodian: "Coinbase",
          strategy_type: "investment.strategy.102"
        }
      ],
      footer: [],
      count: 1
    });
  },

  getAllStorageFeesHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('ColdStorageAccountStorageFeeListComponent', () => {
  let component: ColdStorageAccountStorageFeeListComponent;
  let fixture: ComponentFixture<ColdStorageAccountStorageFeeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageAccountStorageFeeModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ColdStorageService, useValue: ColdStorageServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdStorageAccountStorageFeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
