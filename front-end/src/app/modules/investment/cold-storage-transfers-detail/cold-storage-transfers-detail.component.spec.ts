import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { ColdStorageTransfersDetailComponent } from './cold-storage-transfers-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { testHeaderLov } from '../../../testing/commonTests';
import { getAllTimelineDataData } from '../../../testing/service-mock/investment.service.mock';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { getAllTransfersData, confirmTransferData } from '../../../testing/service-mock/coldStorage.service.mock';
import { permissions } from '../../../config/permissions';
import { AuthService } from '../../../services/auth/auth.service';


describe('RecipeRunDetailComponent', () => {
  let component: ColdStorageTransfersDetailComponent;
  let fixture: ComponentFixture<ColdStorageTransfersDetailComponent>;
  let authService: AuthService;
  let investmentService: InvestmentService;
  let coldStorageService: ColdStorageService;
  let getPermissionsSpy;
  let timelineSpy;
  let getAllTransfersSpy;
  let confirmTransferSpy;


  const approveButton: () => HTMLButtonElement = () => {
    return fixture.nativeElement.querySelector('app-data-table table tbody td:last-child app-action-cell label');
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(ColdStorageTransfersDetailComponent);
    component = fixture.componentInstance;

    authService = fixture.debugElement.injector.get(AuthService);
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    getPermissionsSpy = spyOn(authService, 'getPermissions').and.returnValue([]);
    getAllTransfersSpy = spyOn(coldStorageService, 'getAllTransfers').and.returnValue(fakeAsyncResponse(getAllTransfersData));
    timelineSpy = spyOn(investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getAllTimelineDataData.timeline));
    confirmTransferSpy = spyOn(coldStorageService, 'confirmTransfer').and.returnValue(fakeAsyncResponse(confirmTransferData));

    fixture.detectChanges();

    getAllTransfersSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipe run details table data on init', () => {
    expect(component.listDataSource.body).toEqual(getAllTransfersData.transfers);
    expect(component.listDataSource.footer).toEqual(getAllTransfersData.footer);
    expect(component.count).toEqual(getAllTransfersData.count);
  });

  it('should load timeline data on init', () => {
    expect(timelineSpy).toHaveBeenCalled();
    expect(component.timeline$).not.toBeNull();
  });

  it('should set header LOV observables for recipe run details table specified columns', () => {
    const headerLovColumns = [
      'asset',
      'status',
      'source_account',
      'source_exchange',
      'strategy_type',
      'custodian',
      'cold_storage_account_id'
    ];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });


  describe('if user dont have APPROVE_COLD_STORAGE_TRANSFERS permissions', () => {
    describe('if transfer status is pending', () => {
      beforeEach((done) => {
        changeStatus(done, 'cold_storage_transfers.status.91');
      });


      it('should not show actions column', () => {
        const button = approveButton();
        expect(button).toBeFalsy();
      });
    });
  });


  describe('if user have APPROVE_COLD_STORAGE_TRANSFERS permissions', () => {
    beforeEach(() => {
      getPermissionsSpy.and.returnValue([permissions.APPROVE_COLD_STORAGE_TRANSFERS]);
    });


    describe('if status is pending', () => {
      beforeEach((done) => {
        changeStatus(done, 'cold_storage_transfers.status.91');
      });


      it('should append actions column', () => {
        const buttons = approveButton();
        expect(buttons).toBeTruthy();
      });


      describe('when approve button pressed', () => {
        beforeEach(() => {
          const button = approveButton();
          click(button);
        });


        it('should try approve transfer', () => {
          expect(confirmTransferSpy).toHaveBeenCalled();
        });

        /* only changing status property of single row, this test can't test this
        it('should update transfers list on success', () => {
          getAllTransfersSpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();

            expect(component.listDataSource.body).toEqual(confirmTransferData.transfers);
            expect(component.listDataSource.footer).toEqual(confirmTransferData.footer);
            expect(component.count).toEqual(confirmTransferData.count);
          });
        }); */
      });
    });


    describe('if status is completed', () => {
      beforeEach((done) => {
        changeStatus(done, 'cold_storage_transfers.status.94');
      });


      it('should not append actions column', () => {
        const buttons = approveButton();
        expect(buttons).toBeFalsy();
      });

    });

  });


  function changeStatus(done: DoneFn, status: string) {
    const transfersData = _.cloneDeep(getAllTransfersData);

    transfersData.transfers[0].status = status;
    getAllTransfersSpy.and.returnValue((fakeAsyncResponse(transfersData)));
    component.getAllData();

    getAllTransfersSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  }
});
