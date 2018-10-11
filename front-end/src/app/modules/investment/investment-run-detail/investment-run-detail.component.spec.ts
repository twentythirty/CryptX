import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { InvestmentRunDetailComponent } from './investment-run-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { getSingleInvestmentData,
         getDepositAmountsData,
         getAllRecipesData,
         getTimelineDataData,
         createRecipeRunResponse} from '../../../testing/service-mock/investment.service.mock';

describe('InvestmentRunDetailComponent', () => {
  let component: InvestmentRunDetailComponent;
  let fixture: ComponentFixture<InvestmentRunDetailComponent>;
  let investmentService: InvestmentService;
  let timelineSpy;
  let navigateSpy;
  let getSingleInvestmentSpy;
  let getDepositAmountsSpy;
  let getAllRecipesSpy;
  let createRecipeRunSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        CurrencyPipe,
        InvestmentService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentRunDetailComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    timelineSpy = spyOn ( investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getTimelineDataData.timeline));
    navigateSpy = spyOn ( component.router, 'navigate');
    getSingleInvestmentSpy = spyOn (investmentService, 'getSingleInvestment').and.returnValue(fakeAsyncResponse(getSingleInvestmentData));
    getDepositAmountsSpy = spyOn (investmentService, 'getDepositAmounts').and.returnValue(fakeAsyncResponse(getDepositAmountsData));
    getAllRecipesSpy = spyOn (investmentService, 'getAllRecipes').and.returnValue(fakeAsyncResponse(getAllRecipesData));
    createRecipeRunSpy = spyOn (investmentService, 'createRecipeRun').and.returnValue(fakeAsyncResponse(createRecipeRunResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show "start new run" button if any recipe runs are not rejected', () => {
    const recipePending = Object.assign({}, getAllRecipesData);
    recipePending.recipe_runs = [
      {
        approval_comment: 'NO',
        approval_status: 'recipes.status.41',
        approval_timestamp: 1538634240146,
        approval_user: 'Test User',
        approval_user_id: 3,
        created_timestamp: 1538630980595,
        id: 210,
        investment_run_id: 155,
        user_created: 'Test User',
        user_created_id: 3
      },
      {
        approval_comment: 'NO',
        approval_status: 'recipes.status.42',
        approval_timestamp: 1538634240146,
        approval_user: 'Test User',
        approval_user_id: 3,
        created_timestamp: 1538630980595,
        id: 210,
        investment_run_id: 155,
        user_created: 'Test User',
        user_created_id: 3
      }
    ];
    getAllRecipesSpy.and.returnValue(fakeAsyncResponse(recipePending));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      getAllRecipesSpy.calls.mostRecent().returnValue.subscribe((re) => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('a.start');
        expect(button).toBeNull();
      });
    });
  });

  it('should show "start new run" button if all recipe runs are rejected', () => {
    const recipePending = Object.assign({}, getAllRecipesData);
    recipePending.recipe_runs = [
      {
        approval_comment: 'NO',
        approval_status: 'recipes.status.42',
        approval_timestamp: 1538634240146,
        approval_user: 'Test User',
        approval_user_id: 3,
        created_timestamp: 1538630980595,
        id: 210,
        investment_run_id: 155,
        user_created: 'Test User',
        user_created_id: 3
      },
      {
        approval_comment: 'NO',
        approval_status: 'recipes.status.42',
        approval_timestamp: 1538634240146,
        approval_user: 'Test User',
        approval_user_id: 3,
        created_timestamp: 1538630980595,
        id: 210,
        investment_run_id: 155,
        user_created: 'Test User',
        user_created_id: 3
      }
    ];
    getAllRecipesSpy.and.returnValue(fakeAsyncResponse(recipePending));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      getAllRecipesSpy.calls.mostRecent().returnValue.subscribe((re) => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('a.start');
        expect(button).not.toBeNull();
      });
    });
  });

  describe ('After init', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load investment run table data on init', () => {
      fixture.whenStable().then(() => {
        expect(component.singleDataSource.body).toEqual([getSingleInvestmentData.investment_run]);
      });
    });

    it('should load investment run deposits table data on init', () => {
      fixture.whenStable().then(() => {
        expect(component.extraTableDataSource.body).toEqual(getDepositAmountsData.deposit_amounts);
        expect(component.listDataSource.footer).toEqual(getDepositAmountsData.footer);
      });
    });

    it('should load selected asset mix table data on init', () => {
      fixture.whenStable().then(() => {
        expect(component.listDataSource.body).toEqual(getSingleInvestmentData.asset_mix);
        expect(component.listDataSource.footer).toEqual(getSingleInvestmentData.footer);
        expect(component.count).toEqual(getSingleInvestmentData.count);
      });
    });

    it('should load recipe runs table data on init', () => {
      fixture.whenStable().then(() => {
        expect(component.detailTableDataSource.body).toEqual(getAllRecipesData.recipe_runs);
      });
    });

    it('should load timeline data on Init', () => {
      expect(timelineSpy).toHaveBeenCalled();
      expect(component.timeline$).not.toBeNull();
    });

    it('should open rationale modal on recipe runs table button "read" press', () => {
      const tables = fixture.nativeElement.querySelectorAll('app-data-table');
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = tables[3].querySelector('table tbody tr app-action-cell label');
        click(button);
        fixture.detectChanges();
        const modal = fixture.nativeElement.querySelector('app-modal');
        expect(modal).not.toBeNull();
      });
    });

    it('should navigate to recipe run on recipe runs table row click', () => {
      const tables = fixture.nativeElement.querySelectorAll('app-data-table');
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const tableRow = tables[3].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).toHaveBeenCalledWith([`/run/recipe/${getAllRecipesData.recipe_runs[0].id}`]);
      });
    });

    it('should not navigate on asset mix table row click', () => {
      const tables = fixture.nativeElement.querySelectorAll('app-data-table');
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const tableRow = tables[2].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('if recipe runs list is empty', () => {
    beforeEach(() => {
      const noRecipes = Object.assign({}, getAllRecipesData);
      noRecipes.recipe_runs = [];
      getAllRecipesSpy.and.returnValue(fakeAsyncResponse(noRecipes));
    });

    it('should show "start new run" button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        getAllRecipesSpy.calls.mostRecent().returnValue.subscribe(() => {
          expect(component.detailTableDataSource.body).toEqual([]);
          const button = fixture.nativeElement.querySelector('a.start');
          expect(button).not.toBeNull();
        });
      });
    });

    it('should update tables data on "start new run" button click', fakeAsync(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('a.start');
      getSingleInvestmentSpy.calls.reset();
      getDepositAmountsSpy.calls.reset();
      getAllRecipesSpy.calls.reset();
      click(button);
      tick();
      expect(createRecipeRunSpy).toHaveBeenCalled();
      expect(getSingleInvestmentSpy).toHaveBeenCalled();
      expect(getDepositAmountsSpy).toHaveBeenCalled();
      expect(getAllRecipesSpy).toHaveBeenCalled();
    }));
  });
});
