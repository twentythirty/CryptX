import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { DepositModule } from '../deposit.module';
import { DepositListComponent } from './deposit-list.component';
import { DepositService } from '../../../services/deposit/deposit.service';
import { AuthService } from '../../../services/auth/auth.service';
import { getAllDepositsData, getHeaderLOVData } from '../../../testing/service-mock/deposit.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { permissions } from '../../../config/permissions';


describe('DepositListComponent', () => {
  let component: DepositListComponent;
  let fixture: ComponentFixture<DepositListComponent>;
  let router: Router;
  let depositService: DepositService;
  let authService: AuthService;
  let getAllDepositsSpy;
  let getHeaderLOVSpy;
  let navigateSpy;
  let getPermissionsSpy;

  const tableFirstRow: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('tbody tr');
  };
  const depositApproveButton: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('tbody td:last-child app-action-cell label');
  };
  const depositApproveModal: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-deposit-approve app-modal');
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DepositModule,
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(DepositListComponent);
    component = fixture.componentInstance;

    router = fixture.debugElement.injector.get(Router);
    depositService = fixture.debugElement.injector.get(DepositService);
    authService = fixture.debugElement.injector.get(AuthService);
    getAllDepositsSpy = spyOn(depositService, 'getAllDeposits').and.returnValue(fakeAsyncResponse(getAllDepositsData));
    getHeaderLOVSpy = spyOn(depositService, 'getHeaderLOV').and.returnValue(fakeAsyncResponse(getHeaderLOVData));
    navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();

    getAllDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load deposits on init', () => {
    expect(component.depositDataSource.body).toEqual(getAllDepositsData.recipe_deposits);
    expect(component.depositDataSource.footer).toEqual(getAllDepositsData.footer);
    expect(component.count).toEqual(getAllDepositsData.count);
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['quote_asset', 'exchange', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.depositDataSource, headerLovColumns));
  });

  it('should be navigated to deposid route on table row click', () => {
    const row = tableFirstRow();
    click(row);

    expect(navigateSpy).toHaveBeenCalledWith(['/deposits/view', 1]);
  });

  it('should not show deposit approve button if user dont have APPROVE_DEPOSITS permissions', () => {
    const btn = depositApproveButton();
    expect(btn).toBeFalsy('approve button found');
  });


  describe('user with APPROVE_DEPOSITS permissions', () => {
    beforeEach((done) => {
      getPermissionsSpy = spyOn(authService, 'getPermissions').and.returnValue([permissions.APPROVE_DEPOSITS]);
      component.getAllData();

      getAllDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });


    it('should show deposit approve button', () => {
      const btn = depositApproveButton();
      expect(btn).toBeTruthy('approve button not found');
    });

    it('should not show deposit approve button if deposit status update to "Completed"', () => {
      component.depositDataSource.body[0].status = 'deposits.status.151';
      component.appendActionColumnForDeposits();
      fixture.detectChanges();

      const btn = depositApproveButton();
      expect(btn).toBeFalsy('approve button found');

      // rollback status
      component.depositDataSource.body[0].status = 'deposits.status.150';
      component.appendActionColumnForDeposits();
    });


    describe('when deposit approve button pressed', () => {
      beforeEach(() => {
        const btn = depositApproveButton();
        click(btn);
        fixture.detectChanges();
      });


      it('should open deposit approve modal', () => {
        const modal = depositApproveModal();
        expect(modal).toBeTruthy('modal not found');
      });
    });
  });


});
