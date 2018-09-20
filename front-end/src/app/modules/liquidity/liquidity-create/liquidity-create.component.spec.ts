import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, errorResponse } from '../../../testing/utils';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityCreateComponent } from './liquidity-create.component';
import { LiquidityService } from '../../../services/liquidity/liquidity.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { testFormControlForm } from '../../../testing/commonTests';
import { getAllInstrumentsData } from '../../../testing/service-mock/instruments.service.mock';
import { getAllExchangesData } from '../../../testing/service-mock/exchanges.service.mock';
import { postLiquidityRequirementData } from '../../../testing/service-mock/liquidity.service.mock';


describe('LiquidityCreateComponent', () => {
  let component: LiquidityCreateComponent;
  let fixture: ComponentFixture<LiquidityCreateComponent>;
  let exchangesService: ExchangesService;
  let instrumentsService: InstrumentsService;
  let liquidityService: LiquidityService;
  let getAllInstrumentsSpy;
  let getAllExchangesSpy;
  let createLiquidityRequirementSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LiquidityModule,
        ...extraTestingModules
      ],
      providers: [
        LiquidityService,
        ExchangesService,
        InstrumentsService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityCreateComponent);
    component = fixture.componentInstance;
    instrumentsService = fixture.debugElement.injector.get(InstrumentsService);
    exchangesService = fixture.debugElement.injector.get(ExchangesService);
    liquidityService = fixture.debugElement.injector.get(LiquidityService);
    getAllInstrumentsSpy = spyOn(instrumentsService, 'getAllInstruments').and.returnValue(fakeAsyncResponse(getAllInstrumentsData));
    getAllExchangesSpy = spyOn(exchangesService, 'getAllExchanges').and.returnValue(fakeAsyncResponse(getAllExchangesData));
    createLiquidityRequirementSpy = spyOn(liquidityService, 'createLiquidityRequirement').and.returnValue(
      fakeAsyncResponse(postLiquidityRequirementData));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load instruments on init', () => {
    const instruments = getAllInstrumentsData.instruments.map(instrument => {
        return {
          id: instrument.id,
          value: instrument.symbol
        };
      });
    fixture.whenStable().then(() => {
      expect(component.instruments).toEqual(instruments);
    });
  });

  it('should load exchanges on init', () => {
    const exchanges = getAllExchangesData.exchanges.map(exchange => {
        return {
          id: exchange.id,
          value: exchange.name
        };
      });
    exchanges.push ({
        id: 0,
        value: 'exchanges.all_exchanges'
      });
    fixture.whenStable().then(() => {
      expect(component.exchanges).toEqual(exchanges);
    });
  });

  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.form,
      submitButton: fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        component.form.controls.instrument_id.setValue(1);
        component.form.controls.exchange_id.setValue(2);
        component.form.controls.periodicity.setValue(2);
        component.form.controls.minimum_circulation.setValue(2);
        fixture.detectChanges();
      },
      changeToUnsuccess: () => {
        createLiquidityRequirementSpy.and.returnValue(fakeAsyncResponse(errorResponse));
      }
    };
  });

});
