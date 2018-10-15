import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { extraTestingModules, fakeAsyncResponse, click, newEvent } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { DepositDetailComponent } from './deposit-detail.component';
import { InvestmentService, AssetConversionStatus } from '../../../services/investment/investment.service';
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
  let calculateDepositsSpy;
  let navigateSpy;
  let getPermissionsSpy;

  const conversionTable: () => HTMLElement = () => {
    return fixture.nativeElement.querySelectorAll('app-data-table table')[0];
  };
  const depositTable: () => HTMLElement = () => {
    return fixture.nativeElement.querySelectorAll('app-data-table table')[1];
  };
  const conversionRowActionButtons: (number) => NodeListOf<HTMLElement> = (rowIndex) => {
    return conversionTable().querySelectorAll(`tbody tr:nth-child(${++rowIndex}) td:last-child label`);
  };
  const depositRowActionButtons: (number) => NodeListOf<HTMLElement> = (rowIndex) => {
    return depositTable().querySelectorAll(`tbody tr:nth-child(${++rowIndex}) td:last-child label`);
  };
  const conversionAmountModal: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('.conversion-amount-modal');
  };
  const conversionAmountFormInput: () => HTMLInputElement = () => {
    return conversionAmountModal().querySelector('form input');
  };
  const conversionAmountFormButton: () => HTMLButtonElement = () => {
    return conversionAmountModal().querySelector('form .btn');
  };
  const calcDepositsButton: () => HTMLButtonElement = () => {
    return fixture.nativeElement.querySelector('[calculate-deposits-button] button');
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
    getAllRecipeDepositsSpy = spyOn(investmentService, 'getAllRecipeDeposits')
      .and.returnValue(fakeAsyncResponse({ success: true, recipe_deposits: [], count: 0, footer: [] }));
    getAllTimelineDataSpy = spyOn(investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getAllTimelineDataData));
    submitAssetConversionSpy = spyOn(investmentService, 'submitAssetConversion').and.returnValue(fakeAsyncResponse(submitAssetConversionData));
    completeAssetConversionSpy = spyOn(investmentService, 'completeAssetConversion').and.returnValue(fakeAsyncResponse(completeAssetConversionData));
    calculateDepositsSpy = spyOn(investmentService, 'calculateDeposits').and.returnValue(fakeAsyncResponse({ success: true }));
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
    expect(component.listDataSource.body).toEqual([]);
    expect(component.listDataSource.footer).toEqual([]);
    expect(component.count).toEqual(0);
  });


  it('should set header LOV observables for deposits table specified columns', () => {
    const headerLovColumns = ['id', 'quote_asset', 'exchange', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });

  it('should load timeline data on init', () => {
    expect(component.timeline$).toBeTruthy();
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
      const buttons = conversionRowActionButtons(0);
      expect(component.singleDataSource.body[0].status).toBe('asset_conversions.status.501');
      expect(buttons.length).toBe(1, 'buttons != 1');
      expect(buttons[0].classList).toContain('ico-pencil');
    });


    describe('when conversion amount submit button is pressed', () => {
      beforeEach(() => {
        const buttons = conversionRowActionButtons(0);
        click(buttons[0]);
        fixture.detectChanges();
      });


      it('should open conversion amount submit modal', () => {
        const modal = conversionAmountModal();
        expect(modal).toBeTruthy('modal not found');
      });


      describe('amount submit form is filled and submited', () => {
        beforeEach((done) => {
          const submitBtn = conversionAmountFormButton();
          fillConversionAmountForm(25);
          click(submitBtn);

          submitAssetConversionSpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();
            done();
          });
        });


        it('should close conversion amount modal', () => {
          const modal = conversionAmountModal();
          expect(modal).toBeFalsy('modal visible');
        });

        it('should update converion amount in table', () => {
          const amount = component.singleDataSource.body[0].converted_amount;
          expect(amount).toBeTruthy();
        });

        it('should show aditional conversion complete action button', () => {
          const buttons = conversionRowActionButtons(0);
          expect(buttons.length).toBe(2);
          expect(buttons[1].classList).toContain('ico-check-mark');
        });


        describe('when conversion complete button is pressed', () => {
          let conversionTmp;

          beforeEach((done) => {
            conversionTmp = Object.assign({}, component.singleDataSource.body[0]);

            const buttons = conversionRowActionButtons(0);
            click(buttons[1]);

            completeAssetConversionSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('should update conversion data', () => {
            expect(component.singleDataSource.body[0]).not.toEqual(conversionTmp);
          });

          it('should hide all action buttons if status is "Completed"', () => {
            const buttons = conversionRowActionButtons(0);

            expect(component.singleDataSource.body[0].status).toBe(AssetConversionStatus.Completed);
            expect(buttons.length).toBe(0);
          });

        });
      });
    });


    it('should not display calc deposits button if not all conversions are completed', () => {
      const btn = calcDepositsButton();

      expect(btn).toBeFalsy('calc button visible');
      expect(
        component.singleDataSource.body.every(item => item.status === AssetConversionStatus.Completed)
      ).toBeFalsy('all conversions are completed');
    });


    describe('if all conversions are completed', () => {
      beforeEach((done) => {
        const data = _.cloneDeep(getAllConversionsData);

        data.conversions.map(item => {
          item.status = AssetConversionStatus.Completed;
          return item;
        });
        getAllConversionsSpy.and.returnValue(fakeAsyncResponse(data));
        component.getSingleData();

        getAllConversionsSpy.calls.mostRecent().returnValue.subscribe(() => {
          fixture.detectChanges();
          done();
        });
      });


      it('should display calc deposits button', () => {
        const btn = calcDepositsButton();

        expect(
          component.singleDataSource.body.every(item => item.status === AssetConversionStatus.Completed)
        ).toBeTruthy('not all conversions are completed');
        expect(btn).toBeTruthy('calc button invisible');
      });


      describe('when calc deposits button pressed', () => {
        beforeEach((done) => {
          getAllRecipeDepositsSpy.and.returnValue(fakeAsyncResponse(getAllRecipeDepositsData));

          const btn = calcDepositsButton();
          click(btn);

          calculateDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
            getAllRecipeDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });
        });


        it('should create and load deposits', () => {
          expect(component.listDataSource.body.length).toBeGreaterThan(0);
        });

        it('should navigate to deposit information on deposit table row click', () => {
          const row: HTMLElement = depositTable().querySelector('tbody tr');
          click(row);
          expect(navigateSpy).toHaveBeenCalledWith(['/deposits/view', 105]);
        });


        describe('when user dont have APPROVE_DEPOSITS permission', () => {
          beforeEach((done) => {
            getPermissionsSpy.and.returnValue([]);
            component.getAllData();

            getAllRecipeDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('should not show action column', () => {
            const actionCol = _.find(component.listColumnsToShow, item => item.column === 'action');
            expect(actionCol).toBeFalsy('action column found');
          });
        });


        describe('when user have APPROVE_DEPOSITS permission', () => {
          beforeEach((done) => {
            getPermissionsSpy.and.returnValue([permissions.APPROVE_DEPOSITS]);
            component.getAllData();

            getAllRecipeDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('should show action column', () => {
            const actionCol = _.find(component.listColumnsToShow, item => item.column === 'action');
            expect(actionCol).toBeTruthy('action column not found');
          });

          it('should show deposit approve button if deposit is "pending"', () => {
            const buttons = depositRowActionButtons(0);

            expect(buttons[0]).toBeTruthy('button not found');
            expect(component.listDataSource.body[0].status).toBe('deposits.status.150');
          });


          describe('when all deposits are "completed"', () => {
            beforeEach((done) => {
              const data = _.cloneDeep(getAllRecipeDepositsData);

              data.recipe_deposits.map(item => {
                item.status = 'deposits.status.151';
                return item;
              });
              getAllRecipeDepositsSpy.and.returnValue(fakeAsyncResponse(data));
              component.getAllData();

              getAllRecipeDepositsSpy.calls.mostRecent().returnValue.subscribe(() => {
                fixture.detectChanges();
                done();
              });
            });


            it('should not show deposit action column', () => {
              const actionCol = _.find(component.listColumnsToShow, item => item.column === 'action');
              expect(actionCol).toBeFalsy('action column found');
            });
          });

        });

      });
    });

  });


  function fillConversionAmountForm(amount) {
    const input = conversionAmountFormInput();
    input.value = amount;
    input.dispatchEvent(newEvent('input'));
    fixture.detectChanges();
  }


});
