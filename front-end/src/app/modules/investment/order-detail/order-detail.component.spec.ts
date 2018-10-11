import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { OrderDetailComponent } from './order-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { getTimelineDataData, getSingleRecipeData, getAllRecipeOrdersData } from '../../../testing/service-mock/investment.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';


describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let investmentService: InvestmentService;
  let getAllOrdersSpy;
  let getSingleRecipeSpy;
  let timelineSpy;
  let navigateSpy;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        InvestmentService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    getAllOrdersSpy = spyOn (investmentService, 'getAllOrders').and.returnValue(fakeAsyncResponse(getAllRecipeOrdersData));
    getSingleRecipeSpy = spyOn (investmentService, 'getSingleRecipe').and.returnValue(fakeAsyncResponse(getSingleRecipeData));
    timelineSpy = spyOn ( investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getTimelineDataData.timeline));
    navigateSpy = spyOn (component.router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipe run table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.singleDataSource.body).toEqual([getSingleRecipeData.recipe_run]);
    });
  });

  it('should load orders table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.listDataSource.body).toEqual(getAllRecipeOrdersData.recipe_orders);
      expect(component.listDataSource.footer).toEqual(getAllRecipeOrdersData.footer);
      expect(component.count).toEqual(getAllRecipeOrdersData.count);
    });
  });

  it('should load timeline data on Init', () => {
    expect(timelineSpy).toHaveBeenCalled();
    expect(component.timeline$).not.toBeNull();
  });

  it('should set header LOV observables for orders table specified columns', () => {
    const headerLovColumns = ['id', 'instrument', 'side', 'exchange', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });

  it('should open rationale modal on recipe run table button "read" press', () => {
    const modals = fixture.nativeElement.querySelectorAll('app-modal');
    const tables = fixture.nativeElement.querySelectorAll('app-data-table');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const readButton = tables[0].querySelector('table tbody tr app-action-cell label');
      click(readButton);
      fixture.detectChanges();
      expect(modals[0]).not.toBeNull();
    });
  });

  it('should navigate to recipe run on recipe runs table row click', () => {
    const tables = fixture.nativeElement.querySelectorAll('app-data-table');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = tables[0].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).toHaveBeenCalledWith([`/run/recipe/${getSingleRecipeData.recipe_run.id}`]);
    });
  });

  it('should navigate to execution orders on orders table row click', () => {
    const tables = fixture.nativeElement.querySelectorAll('app-data-table');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = tables[1].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).toHaveBeenCalledWith([`/run/execution-order/${getAllRecipeOrdersData.recipe_orders[0].id}`]);
    });
  });
});
