import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { DepositModule } from '../deposit.module';
import { DepositInfoComponent } from './deposit-info.component';
import { DepositService } from '../../../services/deposit/deposit.service';
import { InvestmentService } from '../../../services/investment/investment.service';
import { AuthService } from '../../../services/auth/auth.service';
import { getAllInvestmentsData, getAllTimelineDataData } from '../../../testing/service-mock/investment.service.mock';
import { getDepositData } from '../../../testing/service-mock/deposit.service.mock';
import { permissions } from '../../../config/permissions';


describe('DepositInfoComponent', () => {
  let component: DepositInfoComponent;
  let fixture: ComponentFixture<DepositInfoComponent>;
  let depositService: DepositService;
  let investmentService: InvestmentService;
  let authService: AuthService;
  let getDepositSpy;
  let getAllInvestmentsSpy;
  let getAllTimelineDataSpy;
  let getPermissionsSpy;

  const depositApproveButton: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('tbody td:last-child app-action-cell label');
  };
  const depositApproveBlock: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-deposit-approve');
  };
  const depositApproveModal: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-deposit-approve app-modal');
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DepositModule,
        ...extraTestingModules
      ],
      providers: [
        {
          provide: ActivatedRoute, useValue: {
            params: of({ depositId: 1 })
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(DepositInfoComponent);
    component = fixture.componentInstance;

    depositService = fixture.debugElement.injector.get(DepositService);
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    authService = fixture.debugElement.injector.get(AuthService);
    getDepositSpy = spyOn(depositService, 'getDeposit').and.returnValue(fakeAsyncResponse(getDepositData));
    getAllInvestmentsSpy = spyOn(investmentService, 'getAllInvestments').and.returnValue(fakeAsyncResponse(getAllInvestmentsData));
    getAllTimelineDataSpy = spyOn(investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getAllTimelineDataData));

    fixture.detectChanges();

    getDepositSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load data on init', () => {
    expect(component.depositId).toEqual(1);
    expect(component.depositDataSource.body).toEqual([getDepositData.recipe_deposit]);
    expect(component.activityLog).toEqual(getDepositData.action_logs);
  });

  it('should not show deposit approve button if user dont have APPROVE_DEPOSITS permissions', () => {
    const btn = depositApproveButton();
    expect(btn).toBeFalsy('approve button found');
  });


  describe('user with APPROVE_DEPOSITS permissions', () => {
    beforeEach((done) => {
      getPermissionsSpy = spyOn(authService, 'getPermissions').and.returnValue([permissions.APPROVE_DEPOSITS]);
      component.getDeposit();

      getDepositSpy.calls.mostRecent().returnValue.subscribe(() => {
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
      component.appendActionColumn();
      fixture.detectChanges();

      const btn = depositApproveButton();
      expect(btn).toBeFalsy('approve button found');

      // rollback status
      component.depositDataSource.body[0].status = 'deposits.status.150';
      component.appendActionColumn();
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
