import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityCreateComponent } from './liquidity-create.component';
import { LiquidityService } from '../../../services/liquidity/liquidity.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';


const LiquidityServiceStub = {
  createLiquidityRequirement: () => {
    return fakeAsyncResponse({});
  }
};

const InstrumentsServiceStub = {
  getAllInstruments: () => {
    return fakeAsyncResponse({
      success: true,
      instruments: [
        {
          id: 1,
          symbol: 'BTC/GLC',
          exchanges_connected: '0',
          exchanges_failed: '0'
        }
      ],
      footer: [],
      count: 1
    });
  }
};

const ExchangesServiceStub = {
  getAllExchanges: () => {
    return fakeAsyncResponse({
      success: true,
      exchanges: [
        {
          id: 1,
          name: 'Binance'
        },
        {
          id: 2,
          name: 'Bitfinex'
        }
      ],
      count: 2
    });
  }
};


describe('LiquidityCreateComponent', () => {
  let component: LiquidityCreateComponent;
  let fixture: ComponentFixture<LiquidityCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LiquidityModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: LiquidityService, useValue: LiquidityServiceStub },
        { provide: InstrumentsService, useValue: InstrumentsServiceStub },
        { provide: ExchangesService, useValue: ExchangesServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
