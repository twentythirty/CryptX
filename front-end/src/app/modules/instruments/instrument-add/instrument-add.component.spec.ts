import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, errorResponse } from '../../../testing/utils';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentAddComponent } from './instrument-add.component';
import { AssetService } from '../../../services/asset/asset.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { testFormControlForm } from '../../../testing/commonTests';
import { getAllAssetsData } from '../../../testing/service-mock/asset.service.mock';
import { createInstrumentData } from '../../../testing/service-mock/instruments.service.mock';


describe('InstrumentAddComponent', () => {
  let component: InstrumentAddComponent;
  let fixture: ComponentFixture<InstrumentAddComponent>;
  let assetService: AssetService;
  let instrumentsService: InstrumentsService;
  let getAllAssetsSpy;
  let createInstrumentSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstrumentsModule,
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentAddComponent);
    component = fixture.componentInstance;
    assetService = fixture.debugElement.injector.get(AssetService);
    instrumentsService = fixture.debugElement.injector.get(InstrumentsService);
    getAllAssetsSpy = spyOn(assetService, 'getAllAssets').and.returnValue(fakeAsyncResponse(getAllAssetsData));
    createInstrumentSpy = spyOn(instrumentsService, 'createInstrument').and.returnValue(fakeAsyncResponse(createInstrumentData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have assetsLoading=true before init', () => {
    expect(component.assetsLoading).toBeTruthy();
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


  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.form,
      submitButton: () => fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        component.form.controls.transaction_asset_id.setValue(1);
        component.form.controls.quote_asset_id.setValue(2);
        fixture.detectChanges();
      },
      changeToUnsuccess: () => {
        createInstrumentSpy.and.returnValue(errorResponse);
      }
    };
  });

});
