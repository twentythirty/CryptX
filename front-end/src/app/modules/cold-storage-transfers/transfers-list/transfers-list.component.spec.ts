import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { ColdStorageTransfersModule } from '../cold-storage-transfers.module';
import { TransfersListComponent } from './transfers-list.component';
import { ColdStorageService, TransfersAllResponse } from '../../../services/cold-storage/cold-storage.service';


const ColdStorageServiceStub = {
  getAllTransfers: () => {
    return fakeAsyncResponse<TransfersAllResponse>({
      success: true,
      transfers: [
        {
          id: 9,
          asset_id: 2,
          asset: "BTC",
          gross_amount: "1.1",
          net_amount: "1.0999",
          exchange_withdrawal_fee: "0.0001",
          status: "cold_storage_transfers.status.92",
          destination_account: "1234",
          custodian: "Coinbase Custody",
          strategy_type: "investment.strategy.102",
          source_exchange: "Binance",
          source_account: "1GDff323q4RGghgLVTi9xeqSkyzRjRrK2",
          placed_timestamp: 1535004629647,
          completed_timestamp: null
        },
      ],
      footer: [],
      count: 1
    });
  },

  getAllTransfersHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('TransfersListComponent', () => {
  let component: TransfersListComponent;
  let fixture: ComponentFixture<TransfersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageTransfersModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ColdStorageService, useValue: ColdStorageServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load transfers on init', () => {
    ColdStorageServiceStub.getAllTransfers().subscribe(res => {
      expect(component.transfersDataSource.body).toEqual(res.transfers);
      expect(component.transfersDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

});
