import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';
import { of } from 'rxjs';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityListComponent } from './liquidity-list.component';
import { LiquidityService, LiquiditiesAllResponse } from '../../../services/liquidity/liquidity.service';


const LiquidityServiceStub = {
  getHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getAllLiquidities: () => {
    return fakeAsyncResponse<LiquiditiesAllResponse>({
      success: true,
      liquidity_requirements: [],
      footer: [],
      count: 0
    });
  }
};


describe('LiquidityListComponent', () => {
  let component: LiquidityListComponent;
  let fixture: ComponentFixture<LiquidityListComponent>;

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
            params: of({ page: 1 }),
          }
        },

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
