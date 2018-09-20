import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';
import { of } from 'rxjs';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityInfoComponent } from './liquidity-info.component';
import { LiquidityService} from '../../../services/liquidity/liquidity.service';
import { getLiquidityData, getExchangesData } from '../../../testing/service-mock/liquidity.service.mock';


describe('LiquidityInfoComponent', () => {
  let component: LiquidityInfoComponent;
  let fixture: ComponentFixture<LiquidityInfoComponent>;
  let liquidityService: LiquidityService;
  let getLiquidityRequirementSpy;
  let getLiquidityExchangesSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LiquidityModule,
        ...extraTestingModules
      ],
      providers: [
        LiquidityService,
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
    liquidityService = fixture.debugElement.injector.get(LiquidityService);
    getLiquidityRequirementSpy = spyOn (liquidityService, 'getExchanges').and.returnValue(
      fakeAsyncResponse(getLiquidityData));
    getLiquidityExchangesSpy = spyOn (liquidityService, 'getLiquidity').and.returnValue(
      fakeAsyncResponse(getExchangesData));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load liquidity requirement on init', () => {
    fixture.whenStable().then(() => {
      expect(component.liquidityDataSource.body).toEqual([getLiquidityData.liquidity_requirement]);
    });
  });

  it('should correctly load liquidity requirement exchanges on init', () => {
    fixture.whenStable().then(() => {
      expect(component.exchangesDataSource.body).toEqual(getExchangesData.exchanges);
      expect(component.exchangesDataSource.footer).toEqual(getExchangesData.footer);
    });
  });

});
