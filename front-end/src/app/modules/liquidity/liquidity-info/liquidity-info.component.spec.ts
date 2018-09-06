import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';
import { of } from 'rxjs';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityInfoComponent } from './liquidity-info.component';
import { LiquidityService, LiquidityResponse, ExchangesResponse } from '../../../services/liquidity/liquidity.service';


const LiquidityServiceStub = {
  getLiquidity: () => {
    return fakeAsyncResponse<LiquidityResponse>({
      success: true,
      liquidity_requirement: {
        id: 20,
        instrument_id: 3883,
        instrument: 'BAT/BTC',
        periodicity: 7,
        quote_asset: 'BTC',
        minimum_circulation: '100000',
        exchange: 'common.all',
        exchange_count: '3',
        exchange_pass: '3',
        exchange_not_pass: '0'
      },
    });
  },

  getExchanges: () => {
    return fakeAsyncResponse<ExchangesResponse>({
      success: true,
      exchanges: [],
      footer: [],
      count: 0
    });
  }
};


describe('LiquidityInfoComponent', () => {
  let component: LiquidityInfoComponent;
  let fixture: ComponentFixture<LiquidityInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LiquidityModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: LiquidityService, useValue: LiquidityServiceStub },
        {
          provide: ActivatedRoute, useValue: {
            queryParams: of({ page: 1 }),
            params: of({ id: 1 }),
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
