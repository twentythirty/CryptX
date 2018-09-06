import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentInfoComponent } from './instrument-info.component';
import { InstrumentsService, InstrumentsGetResponse } from '../../../services/instruments/instruments.service';
import { ExchangesService, ExchangesAllResponse } from '../../../services/exchanges/exchanges.service';


const InstrumentsServiceStub = {
  getInstrument: () => {
    return fakeAsyncResponse<InstrumentsGetResponse>({
      success: true,
      instrument: {
        id: 3888,
        symbol: 'BCD/ETH',
        exchanges_connected: '1',
        exchanges_failed: '0'
      }
    });
  }
};

const ExchangesServiceStub = {
  getAllExchanges: () => {
    return fakeAsyncResponse<ExchangesAllResponse>({
      success: true,
      exchanges: [
        {
          id: 1,
          name: 'Binance'
        },
        {
          id: 2,
          name: 'Bitfinex'
        },
      ],
      count: 2
    });
  }
};


describe('InstrumentInfoComponent', () => {
  let component: InstrumentInfoComponent;
  let fixture: ComponentFixture<InstrumentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstrumentsModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InstrumentsService, useValue: InstrumentsServiceStub },
        { provide: ExchangesService, useValue: ExchangesServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
