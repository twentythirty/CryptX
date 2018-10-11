import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { ColdStorageTransfersModule } from '../cold-storage-transfers.module';
import { TransfersListComponent } from './transfers-list.component';
import { ColdStorageService, TransfersAllResponse } from '../../../services/cold-storage/cold-storage.service';
import { getAllTransfersData } from '../../../testing/service-mock/coldStorage.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';



describe('TransfersListComponent', () => {
  let component: TransfersListComponent;
  let fixture: ComponentFixture<TransfersListComponent>;
  let coldStorageService: ColdStorageService;
  let getAllTransfersSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageTransfersModule,
        ...extraTestingModules
      ],
      providers: [
        ColdStorageService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfersListComponent);
    component = fixture.componentInstance;
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    getAllTransfersSpy = spyOn (coldStorageService, 'getAllTransfers').and.returnValue(fakeAsyncResponse(getAllTransfersData));
    navigateSpy = spyOn (component.router, 'navigate');
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load transfers on init', () => {
    fixture.whenStable().then(() => {
      expect(component.transfersDataSource.body).toEqual(getAllTransfersData.transfers);
      expect(component.transfersDataSource.footer).toEqual(getAllTransfersData.footer);
      expect(component.count).toEqual(getAllTransfersData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['asset', 'status', 'source_account', 'source_exchange',
                              'strategy_type', 'custodian', 'cold_storage_account_id'];

    fixture.whenStable().then(() => testHeaderLov(component.transfersDataSource, headerLovColumns));
  });

  it('should should navigate to asset view on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/assets/view/', getAllTransfersData.transfers[0].asset_id]);
    });
  });

});
