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
    return fakeAsyncResponse({});
  }
};

const ExchangesServiceStub = {
  getAllExchanges: () => {
    return fakeAsyncResponse({});
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
