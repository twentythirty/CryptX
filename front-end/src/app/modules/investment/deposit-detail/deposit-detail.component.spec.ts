import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse, click, newEvent } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { DepositDetailComponent } from './deposit-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { AuthService } from '../../../services/auth/auth.service';
import {
  getAllConversionsData,
  getAllTimelineDataData,
  completeAssetConversionData,
  submitAssetConversionData,
  getAllRecipeDepositsData,
} from '../../../testing/service-mock/investment.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { permissions } from '../../../config/permissions';


describe('DepositDetailComponent', () => {
  let component: DepositDetailComponent;
  let fixture: ComponentFixture<DepositDetailComponent>;
  let investmentService: InvestmentService;
  let authService: AuthService;
  let router: Router;
  let getAllConversionsSpy;
  let getAllRecipeDepositsSpy;
  let getAllTimelineDataSpy;
  let submitAssetConversionSpy;
  let completeAssetConversionSpy;
  let navigateSpy;
  let getPermissionsSpy;

  const conversionTable: () => HTMLElement = () => {
    return fixture.nativeElement.querySelectorAll('app-data-table table')[0];
  };
  const depositTable: () => HTMLElement = () => {
    return fixture.nativeElement.querySelectorAll('app-data-table table')[1];
  };
  const converionRowActionButtons: (number) => NodeListOf<HTMLElement> = (rowIndex) => {
    return conversionTable().querySelectorAll(`tbody tr:nth-child(${++rowIndex}) td:last-child label`);
  };
  const converionAmountModal: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('.conversion-amount-modal');
  };
  const converionAmountFormInput: () => HTMLInputElement = () => {
    return converionAmountModal().querySelector('form input');
  };
  const converionAmountFormButton: () => HTMLButtonElement = () => {
    return converionAmountModal().querySelector('form .btn');
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        {
          provide: ActivatedRoute, useValue: {
            params: of({ id: 1 }),
            queryParams: of({ page: 1 })
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(DepositDetailComponent);
    component = fixture.componentInstance;

    investmentService = fixture.debugElement.injector.get(InvestmentService);
    authService = fixture.debugElement.injector.get(AuthService);
    router = fixture.debugElement.injector.get(Router);
    getAllConversionsSpy = spyOn(investmentService, 'getAllConversions').and.returnValue(fakeAsyncResponse(getAllConversionsData));
    getAllRecipeDepositsSpy = spyOn(investmentService, 'getAllRecipeDeposits').and.returnValue(fakeAsyncResponse(getAllRecipeDepositsData));
    getAllTimelineDataSpy = spyOn(investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getAllTimelineDataData));
    submitAssetConversionSpy = spyOn(investmentService, 'submitAssetConversion').and.returnValue(fakeAsyncResponse(submitAssetConversionData));
    completeAssetConversionSpy = spyOn(investmentService, 'completeAssetConversion').and.returnValue(fakeAsyncResponse(completeAssetConversionData));
    navigateSpy = spyOn(router, 'navigate');
    getPermissionsSpy = spyOn(authService, 'getPermissions').and.returnValue([]);

    fixture.detectChanges();

    forkJoin(
      getAllConversionsSpy.calls.mostRecent().returnValue,
      getAllRecipeDepositsSpy.calls.mostRecent().returnValue,
    ).subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load currency conversion table data on init', () => {
    expect(component.singleDataSource.body).toEqual(getAllConversionsData.conversions);
    expect(component.singleDataSource.footer).toEqual(getAllConversionsData.footer);
  });

  it('should load deposits table data on init', () => {
    expect(component.listDataSource.body).toEqual(getAllRecipeDepositsData.recipe_deposits);
    expect(component.listDataSource.footer).toEqual(getAllRecipeDepositsData.footer);
    expect(component.count).toEqual(getAllRecipeDepositsData.count);
  });


  it('should set header LOV observables for deposits table specified columns', () => {
    const headerLovColumns = ['id', 'quote_asset', 'exchange', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });

  it('should load timeline data on init', () => {
    expect(component.timeline$).toBeTruthy();
  });

  it('should navigate to deposit information on deposit table row click', () => {
    const row: HTMLElement = depositTable().querySelector('tbody tr');
    click(row);
    expect(navigateSpy).toHaveBeenCalledWith(['/deposits/view', 105]);
  });


  describe('when dont user have ALTER_ASSET_CONVERSIONS permissions', () => {
    it('should not show actions column in conversions table', () => {
      const num = component.singleDataSource.header.length;
      const lastColumn = component.singleDataSource.header[num - 1];

      expect(lastColumn.column).not.toBe('action');
    });
  });


  describe('when user have ALTER_ASSET_CONVERSIONS permissions', () => {
    beforeEach((done) => {
      getPermissionsSpy.and.returnValue([permissions.ALTER_ASSET_CONVERSIONS]);
      component.getSingleData();

      getAllConversionsSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });


    it('should show conversion amount submit button if conversion is "Pending"', () => {
      const buttons = converionRowActionButtons(0);
      expect(component.singleDataSource.body[0].status).toBe('asset_conversions.status.501');
      expect(buttons.length).toBe(1, 'buttons != 1');
      expect(buttons[0].classList).toContain('ico-pencil');
    });


    describe('when conversion amount submit button is pressed', () => {
      beforeEach(() => {
        const buttons = converionRowActionButtons(0);
        click(buttons[0]);
        fixture.detectChanges();
      });


      it('should open conversion amount submit modal', () => {
        const modal = converionAmountModal();
        expect(modal).toBeTruthy('modal not found');
      });


      describe('amount submit form is filled and submited', () => {
        beforeEach((done) => {
          const submitBtn = converionAmountFormButton();
          fillConversionAmountForm(23);
          click(submitBtn);

          submitAssetConversionSpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();
            done();
          });
        });


        it('should');
      });
    });


  });


  function fillConversionAmountForm(amount) {
    const input = converionAmountFormInput();
    input.value = amount;
    input.dispatchEvent(newEvent('input'));
    fixture.detectChanges();
  }


});
