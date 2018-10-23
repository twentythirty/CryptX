import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ExchangeAccountsAddComponent } from './exchange-accounts-add.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs/observable/of';
import { extraTestingModules, fakeAsyncResponse, click, errorResponse } from '../../../testing/utils';
import { ExchangeAccountsModule } from '../exchange-accounts.module';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { AssetService } from '../../../services/asset/asset.service';
import { getAllExchangesData,
         getSingleExchangeAccountsData,
         createExchangeAccountData } from '../../../testing/service-mock/exchanges.service.mock';
import { getAllAssetsData } from '../../../testing/service-mock/asset.service.mock';
import { testFormControlForm } from '../../../testing/commonTests';

describe('ExchangeAccountsAddComponent', () => {
  let component: ExchangeAccountsAddComponent;
  let fixture: ComponentFixture<ExchangeAccountsAddComponent>;
  let exchangesService: ExchangesService;
  let assetsService: AssetService;
  let getExchangesSpy;
  let getAssetsSpy;
  let getSingleExchangeAccountSpy;
  let createExchangeAccountSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExchangeAccountsModule,
        ...extraTestingModules
      ],
      providers: [
        ExchangesService,
        AssetService,
      ]
    });
  }));

  describe('if user edit exchange account', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ActivatedRoute, useValue: { params: of({ id: 1 }) }
          }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(ExchangeAccountsAddComponent);
      component = fixture.componentInstance;
      exchangesService = fixture.debugElement.injector.get(ExchangesService);
      assetsService = fixture.debugElement.injector.get(AssetService);
      getExchangesSpy = spyOn (exchangesService, 'getAllExchanges').and.returnValue(fakeAsyncResponse(getAllExchangesData));
      getAssetsSpy = spyOn (assetsService, 'getAllAssets').and.returnValue(fakeAsyncResponse(getAllAssetsData));
      getSingleExchangeAccountSpy = spyOn (exchangesService, 'getSingleExchangeAccount').and.returnValue(fakeAsyncResponse(getSingleExchangeAccountsData));

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should reflect exchange account data', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const inputs = fixture.nativeElement.querySelectorAll('app-input-item');
        expect(inputs[0].querySelector('ng-select').getAttribute('ng-reflect-model')).toEqual((getSingleExchangeAccountsData.exchange_account.exchange_id).toString());
        expect(inputs[1].querySelector('ng-select').getAttribute('ng-reflect-model')).toEqual((getSingleExchangeAccountsData.exchange_account.asset_id).toString());
        expect(inputs[2].querySelector('input').getAttribute('ng-reflect-model')).toEqual(getSingleExchangeAccountsData.exchange_account.address);
      });
    });

    it('should show activate/deactivate button', () => {
      fixture.whenStable().then(() => {
        const button = fixture.nativeElement.querySelector('button.deactive');
        expect(button).not.toBeNull();
      });
    });

    describe('after activate/deactivate button is pressed', () => {
      let deactivateButton;
      let editExchangeAccountSpy;
      let navigateSpy;
      let modal;

      beforeEach((done) => {
        navigateSpy = spyOn (component.router, 'navigate');
        editExchangeAccountSpy = spyOn (exchangesService, 'editExchangeAccountData').and.returnValue(fakeAsyncResponse({success: true}));
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          deactivateButton = fixture.nativeElement.querySelector('button.deactive');
          click(deactivateButton);
          fixture.detectChanges();
          modal = fixture.nativeElement.querySelector('app-confirm');
          done();
        });
        fixture.detectChanges();
      });

      it('should open deactivate confirm modal', () => {
        fixture.whenStable().then(() => {
          expect(modal).not.toBeNull();
        });
      });

      it('should close modal after cancel button is pressed', () => {
        fixture.whenStable().then(() => {
          const cancelButton = fixture.nativeElement.querySelector('app-btn.reject');
          click(cancelButton);
          fixture.detectChanges();
          modal = fixture.nativeElement.querySelector('app-confirm');
          expect(modal).toBeNull();
        });
      });

      it('should navigate to roles list page after successful confirm', () => {
        fixture.whenStable().then(() => {
          const confirmButton = fixture.nativeElement.querySelector('app-btn.confirm');
          click(confirmButton);
          editExchangeAccountSpy.calls.mostRecent().returnValue.subscribe(() => {
            expect(navigateSpy).toHaveBeenCalledWith(['/exchange_account']);
          });
        });
      });

      it('should open error modal after unsuccessful confirm', () => {
        editExchangeAccountSpy.and.returnValue(errorResponse);
        fixture.whenStable().then(() => {
          const confirmButton = fixture.nativeElement.querySelector('app-btn.confirm');
          click(confirmButton);
            fixture.detectChanges();
            const errorModal = fixture.nativeElement.querySelector('app-modal');
            expect(errorModal).not.toBeNull();
            expect(component.showErrorModal).toBeTruthy();
        });
      });
     });
  });

  describe('if user create exchange account', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: []
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(ExchangeAccountsAddComponent);
      component = fixture.componentInstance;
      exchangesService = fixture.debugElement.injector.get(ExchangesService);
      assetsService = fixture.debugElement.injector.get(AssetService);
      getExchangesSpy = spyOn (exchangesService, 'getAllExchanges').and.returnValue(fakeAsyncResponse(getAllExchangesData));
      getAssetsSpy = spyOn (assetsService, 'getAllAssets').and.returnValue(fakeAsyncResponse(getAllAssetsData));
      createExchangeAccountSpy = spyOn (exchangesService, 'createExchangeAccount').and.returnValue(fakeAsyncResponse(createExchangeAccountData));

      fixture.detectChanges();
    });

    it('should load exchanges on Init', () => {
      const exchanges = getAllExchangesData.exchanges.map(exchange => {
        return {
          id: exchange.id,
          value: exchange.name
        };
      });
      fixture.whenStable().then(() => {
        expect(component.exchanges).toEqual(exchanges);
      });
    });

    it('should load assets on Init', () => {
      const assets = getAllAssetsData.assets.map(asset => {
        return {
          id: asset.id,
          value: `${asset.long_name} (${asset.symbol})`
        };
      });
      fixture.whenStable().then(() => {
        expect(component.assets).toEqual(assets);
      });
    });

    it('should show "save" button', () => {
      fixture.whenStable().then(() => {
        const saveButton = fixture.nativeElement.querySelector('button.submit');
        expect(saveButton).not.toBeNull();
      });
    });

    testFormControlForm(() => {
      return {
        component: component,
        fixture: fixture,
        formControl: component.form,
        submitButton: () => fixture.nativeElement.querySelector('button.submit'),
        fillForm: () => {
          component.form.controls.exchangeId.setValue(1);
          component.form.controls.assetId.setValue(1);
          component.form.controls.address.setValue('address');
          fixture.detectChanges();
        },
        changeToUnsuccess: () => {
          createExchangeAccountSpy.and.returnValue(fakeAsyncResponse(errorResponse));
        }
      };
    });
  });
});
