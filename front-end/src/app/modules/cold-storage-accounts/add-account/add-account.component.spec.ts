import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, errorResponse, click } from '../../../testing/utils';

import { ColdStorageAccountsModule } from '../cold-storage-accounts.module';
import { AddAccountComponent } from './add-account.component';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { AssetService } from '../../../services/asset/asset.service';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { getStrategiesData } from '../../../testing/service-mock/modelConstants.service';
import { getAllAssetsData } from '../../../testing/service-mock/asset.service.mock';
import { getAllCustodiansData, addAccountData } from '../../../testing/service-mock/coldStorage.service.mock';
import { testFormControlForm } from '../../../testing/commonTests';


describe('AddAccountComponent', () => {

  let component: AddAccountComponent;
  let fixture: ComponentFixture<AddAccountComponent>;
  let assetService: AssetService;
  let modelConstantsService: ModelConstantsService;
  let coldStorageService: ColdStorageService;
  let navigateSpy;
  let createAccountSpy;
  let getAllAssetsSpy;
  let getAllStrategiesSpy;
  let getAllCustodiansSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageAccountsModule,
        ...extraTestingModules
      ],
      providers: [
        AssetService,
        ModelConstantsService,
        ColdStorageService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAccountComponent);
    component = fixture.componentInstance;
    assetService = fixture.debugElement.injector.get(AssetService);
    modelConstantsService = fixture.debugElement.injector.get(ModelConstantsService);
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    createAccountSpy = spyOn (coldStorageService, 'addAccount').and.returnValue(fakeAsyncResponse(addAccountData));
    getAllCustodiansSpy = spyOn(coldStorageService, 'getAllCustodians').and.returnValue(fakeAsyncResponse(getAllCustodiansData));
    getAllAssetsSpy = spyOn(assetService, 'getAllAssetsDetailed').and.returnValue(fakeAsyncResponse(getAllAssetsData));
    getAllStrategiesSpy = spyOn(modelConstantsService, 'getGroup').and.returnValue(fakeAsyncResponse(getStrategiesData));
    navigateSpy = spyOn(component.router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have assetsLoading=true before init', () => {
    expect(component.assetsLoading).toBeTruthy();
  });

  it('should have custodiansLoading=true before init', () => {
    expect(component.custodiansLoading).toBeTruthy();
  });

  describe('after init', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });
    describe('after assets should be loaded', () => {
      beforeEach((done) => {
        getAllAssetsSpy.calls.mostRecent().returnValue.subscribe(() => {
          done();
        });
      });

      it('should load assets on init', async(() => {
        expect(component.assets.length).toBe(getAllAssetsData.count);
      }));

      it('should get assetsLoading=false', () => {
        expect(component.assetsLoading).toBeFalsy();
      });
    });

    describe('after custodians should be loaded', () => {
      beforeEach((done) => {
        getAllCustodiansSpy.calls.mostRecent().returnValue.subscribe(() => {
          done();
        });
      });

      it('should load custodians on init', async(() => {
        expect(component.custodians.length).toBe(getAllCustodiansData.count);
      }));

      it('should get custodiansLoading=false', () => {
        expect(component.custodiansLoading).toBeFalsy();
      });
    });

    describe('after strategies should be loaded', () => {
      beforeEach((done) => {
        getAllStrategiesSpy.calls.mostRecent().returnValue.subscribe(() => {
          done();
        });
      });

      it('should load strategies on init', async(() => {
        expect(component.strategies.length).toBe(getStrategiesData.length);
      }));
    });

    testFormControlForm(() => {
      return {
        component: component,
        fixture: fixture,
        formControl: component.form,
        submitButton: () => fixture.nativeElement.querySelector('button.submit'),
        fillForm: () => {
          component.form.controls.strategy_type.setValue(1);
          component.form.controls.asset_id.setValue(2);
          component.form.controls.custodian_id.setValue(2);
          component.form.controls.address.setValue('address');
          component.form.controls.tag.setValue('tag');
          fixture.detectChanges();
        },
        changeToUnsuccess: () => {
          createAccountSpy.and.returnValue(fakeAsyncResponse(errorResponse));
        }
      };
    });
  });
});

