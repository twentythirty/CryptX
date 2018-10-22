import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';
import { of } from 'rxjs';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityInfoComponent } from './liquidity-info.component';
import { LiquidityService} from '../../../services/liquidity/liquidity.service';
import { getLiquidityData, getExchangesData, deleteLiquidityData } from '../../../testing/service-mock/liquidity.service.mock';


describe('LiquidityInfoComponent', () => {
  let component: LiquidityInfoComponent;
  let fixture: ComponentFixture<LiquidityInfoComponent>;
  let liquidityService: LiquidityService;
  let router: Router;
  let navigateSpy;
  let getLiquidityRequirementSpy;
  let getLiquidityExchangesSpy;
  let deleteLiquiditySpy;

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
    router = fixture.debugElement.injector.get(Router);
    navigateSpy = spyOn(router, 'navigate');
    getLiquidityRequirementSpy = spyOn(liquidityService, 'getExchanges')
      .and.returnValue(fakeAsyncResponse(getExchangesData));
    getLiquidityExchangesSpy = spyOn(liquidityService, 'getLiquidity')
      .and.returnValue(fakeAsyncResponse(getLiquidityData));
    deleteLiquiditySpy = spyOn(liquidityService, 'deleteLiquidity').and.returnValue(fakeAsyncResponse(deleteLiquidityData));

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


  describe('when delete button pressed', () => {
    beforeEach(() => {
      const btn = fixture.nativeElement.querySelector('app-form-action-bar button');
      click(btn);
      fixture.detectChanges();
    });


    it('should show confirm modal', () => {
      const confirmModal = fixture.nativeElement.querySelector('app-confirm');
      expect(confirmModal).toBeTruthy('confirm modal invisible');
    });


    describe('when confirm button pressed', () => {
      beforeEach(() => {
        const confirmBtns = fixture.nativeElement.querySelectorAll('app-confirm app-btn');
        click(confirmBtns[1]); // confirm
      });


      it('should delete liquidity requirement rule', () => {
        expect(deleteLiquiditySpy).toHaveBeenCalled();
      });


      describe('after success deletion', () => {
        beforeEach((done) => {
          deleteLiquiditySpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();
            done();
          });
        });


        it('should navigate to liquidity requirements list', () => {
          expect(navigateSpy).toHaveBeenCalledWith(['/liquidity_requirements']);
        });
      });

    });
  });

});
