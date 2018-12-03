import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click, newEvent } from '../../../testing/utils';

import { InvestmentNewComponent } from './investment-new.component';
import { DashboardModule } from '../dashboard.module';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { InvestmentService } from '../../../services/investment/investment.service';
import { getConstantsData } from '../../../testing/service-mock/modelConstants.service';
import { createInvestmentRunData, createAssetMixData, getAssetMixData } from '../../../testing/service-mock/investment.service.mock';
import { Router } from '@angular/router';


fdescribe('InvestmentNewComponent', () => {
  let component: InvestmentNewComponent;
  let fixture: ComponentFixture<InvestmentNewComponent>;
  let modelConstantsService: ModelConstantsService;
  let investmentService: InvestmentService;
  let router: Router;
  let getConstantsSpy;
  let createInvestmentRunSpy;
  let createAssetMixSpy;
  let getAssetMixSpy;
  let onCloseSpy;
  let onCompleteSpy;
  let navigateSpy;

  // const strategyTypeForm: () => HTMLElement = () => {
  //   return fixture.nativeElement.querySelectorAll('form.select-box')[0];
  // };
  const portfolioForm: () => HTMLElement = () => {
    return fixture.nativeElement.querySelectorAll('form.select-box')[0];
  };
  // const strategyButton: (number) => HTMLElement = (index) => {
  //   return strategyTypeForm().querySelector(`app-button-radio:nth-child(${++index}) label`);
  // };
  const portfolioButton: (number) => HTMLElement = (index) => {
    return portfolioForm().querySelector(`app-button-radio:nth-child(${++index}) label`);
  };
  const discardButton: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('button.btn.grey');
  };
  const confirmButton: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('button.btn.new');
  };
  const step3Block: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('[step-3]');
  };
  const usdInput: () => HTMLInputElement = () => {
    return fixture.nativeElement.querySelector('app-input-item[formControlName="deposit_usd"] input');
  };
  const btcInput: () => HTMLInputElement = () => {
    return fixture.nativeElement.querySelector('app-input-item[formControlName="deposit_btc"] input');
  };
  const ethInput: () => HTMLInputElement = () => {
    return fixture.nativeElement.querySelector('app-input-item[formControlName="deposit_eth"] input');
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DashboardModule,
        ...extraTestingModules
      ],
      providers: [
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentNewComponent);
    component = fixture.componentInstance;

    modelConstantsService = fixture.debugElement.injector.get(ModelConstantsService);
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    router = fixture.debugElement.injector.get(Router);
    getConstantsSpy = spyOn(modelConstantsService, 'getConstants').and.returnValue(getConstantsData); // not async
    createInvestmentRunSpy = spyOn(investmentService, 'createInvestmentRun').and.returnValue(fakeAsyncResponse(createInvestmentRunData));
    createAssetMixSpy = spyOn(investmentService, 'createAssetMix').and.returnValue(fakeAsyncResponse(createAssetMixData));
    getAssetMixSpy = spyOn(investmentService, 'getAssetMix').and.returnValue(fakeAsyncResponse(getAssetMixData));
    onCloseSpy = spyOn(component, 'onClose');
    onCompleteSpy = spyOn(component.onComplete, 'emit').and.callThrough();
    navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show first form step if investment mode or portfolio not selected', () => {
    // const form1 = strategyTypeForm();
    const form2 = portfolioForm();

    expect(component.strategyType).toBeNull();
   // expect(component.isSimulated).toBeNull();
   // expect(form1).toBeTruthy();
    expect(form2).toBeTruthy();
  });


  describe('when investment mode and portfolio is selected', () => {
    beforeEach(() => {
      completeFirstStep();
    });


    it('should create asset mix', () => {
      expect(createAssetMixSpy).toHaveBeenCalled();
    });


    describe('when asset mix is created', () => {
      beforeEach((done) => {
        createAssetMixSpy.calls.mostRecent().returnValue.subscribe(() => {
          fixture.detectChanges();
          done();
        });
      });


      it('should load asset mix', () => {
        expect(getAssetMixSpy).toHaveBeenCalled();
      });


      describe('when asset mix is loaded', () => {
        beforeEach((done) => {
          getAssetMixSpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();
            done();
          });
        });


        it('should show second step', () => {
          const controls = fixture.nativeElement.querySelector('.top-controls');
          const table = fixture.nativeElement.querySelector('app-data-table');

          expect(controls).toBeTruthy('table controls invisible');
          expect(table).toBeTruthy('table invisible');
        });


        describe('when discard button is pressed', () => {
          beforeEach(() => {
            const btn = discardButton();

            click(btn);
            fixture.detectChanges();
          });


          it('should emit close event', () => {
            expect(onCloseSpy).toHaveBeenCalled();
          });
        });


        describe('when confirm button is pressed', () => {
          beforeEach(() => {
            const btn = confirmButton();

            click(btn);
            fixture.detectChanges();
          });


          it('should get skipped asset mix', () => {
            expect(getAssetMixSpy).toHaveBeenCalled();
          });


          describe('when skipped assets are loaded', () => {
            beforeEach((done) => {
              getAssetMixSpy.calls.mostRecent().returnValue.subscribe(() => {
                fixture.detectChanges();
                done();
              });
            });


            it('should add "status" column to table', () => {
              expect(component.assetDataSource.header.find(item => item.column === 'status')).toBeTruthy('status column not found');
              expect(component.assetColumnsToShow.find(item => item.column === 'status')).toBeTruthy('status column not found');
            });

            it('should add "actions" column to table', () => {
              expect(component.assetDataSource.header.find(item => item.column === 'actions')).toBeTruthy('actions column not found');
              expect(component.assetColumnsToShow.find(item => item.column === 'actions')).toBeTruthy('actions column not found');
            });


            describe('when confirm button is pressed', () => {
              beforeEach(() => {
                const btn = confirmButton();

                click(btn);
                fixture.detectChanges();
              });


              it('should show 3th step', () => {
                const step3 = step3Block();
                expect(step3).toBeTruthy('step 3 not found');
              });


              describe('when confirm invalid form', () => {
                beforeEach(() => {
                  const btn = confirmButton();
                  click(btn);
                  fixture.detectChanges();
                });


                it('should not complete creation', () => {
                  expect(onCompleteSpy).not.toHaveBeenCalled();
                });
              });


              describe('when confirm valid form', () => {
                beforeEach((done) => {
                  const submitBtn = confirmButton();

                  fillLastStep('50', '10', '15');
                  click(submitBtn);
                  fixture.detectChanges();

                  createInvestmentRunSpy.calls.mostRecent().returnValue.subscribe(() => {
                    fixture.detectChanges();
                    done();
                  });
                });


                it('should emit close event', () => {
                  expect(onCloseSpy).toHaveBeenCalled();
                });

                it('should complete creation', () => {
                  expect(onCompleteSpy).toHaveBeenCalled();
                });

                it('should navigate to investment run', () => {
                  expect(navigateSpy).toHaveBeenCalledWith(['/run/investment', 5]);
                });
              });
            });
          });
        });
      });

    });

  });


  function completeFirstStep() {
    // const btn1 = strategyButton(0);
    const btn2 = portfolioButton(0);

    // click(btn1);
    // btn1.dispatchEvent(newEvent('change'));
    // fixture.detectChanges();

    click(btn2);
    btn2.dispatchEvent(newEvent('change'));
    fixture.detectChanges();
  }

  function fillLastStep(usd: string, btc: string = '', eth: string = '') {
    const usdInp = usdInput();
    const btcInp = btcInput();
    const ethInp = ethInput();

    usdInp.value = usd;
    usdInp.dispatchEvent(newEvent('input'));
    btcInp.value = btc;
    btcInp.dispatchEvent(newEvent('input'));
    ethInp.value = eth;
    ethInp.dispatchEvent(newEvent('input'));

    fixture.detectChanges();
  }

});
