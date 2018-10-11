import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { OrderGroupComponent } from './order-group.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { OrdersService } from '../../../services/orders/orders.service';
import { getOrderGroupOfRecipeData,
         getAllOrdersByGroupIdData,
         generateOrdersData } from '../../../testing/service-mock/orders.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { getTimelineDataData } from '../../../testing/service-mock/investment.service.mock';


describe('OrderGroupComponent', () => {
  let component: OrderGroupComponent;
  let fixture: ComponentFixture<OrderGroupComponent>;
  let ordersService: OrdersService;
  let investmentService: InvestmentService;
  let generateOrdersSpy;
  let ordersGroupOfRecipeSpy;
  let ordersOfGroupSpy;
  let timelineSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        OrdersService,
        InvestmentService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderGroupComponent);
    component = fixture.componentInstance;
    ordersService = fixture.debugElement.injector.get(OrdersService);
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    ordersGroupOfRecipeSpy = spyOn ( ordersService, 'getOrderGroupOfRecipe').and.returnValue(fakeAsyncResponse(getOrderGroupOfRecipeData));
    ordersOfGroupSpy = spyOn ( ordersService, 'getAllOrdersByGroupId').and.returnValue(fakeAsyncResponse(getAllOrdersByGroupIdData));
    generateOrdersSpy = spyOn ( ordersService, 'generateOrders').and.returnValue(fakeAsyncResponse(generateOrdersData));
    timelineSpy = spyOn ( investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getTimelineDataData.timeline));
    navigateSpy = spyOn (component.router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show generate orders button', () => {
    const button = fixture.nativeElement.querySelector('app-btn button.start');
    expect(button).toBeNull();
  });

  it('should show "generate orders" button if order group not exist', () => {
    ordersGroupOfRecipeSpy.and.returnValue(fakeAsyncResponse({}));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      ordersGroupOfRecipeSpy.calls.mostRecent().returnValue.subscribe(res => {
        expect(component.showGenerateOrders).toBeTruthy();
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-btn button.start');
        expect(button).not.toBeNull();
      });
    });
  });

  it('should show "generate orders" button if order group is rejected', () => {
    const rejectedOrderGroup = getOrderGroupOfRecipeData;
    rejectedOrderGroup.recipe_order_group.status = 'orders_group.status.82';
    ordersGroupOfRecipeSpy.and.returnValue(fakeAsyncResponse(rejectedOrderGroup));
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      ordersGroupOfRecipeSpy.calls.mostRecent().returnValue.subscribe(() => {
        expect(component.showGenerateOrders).toBeTruthy();
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-btn button.start');
        expect(button).not.toBeNull();
      });
    });
  });

  it('should not show "generate orders" button if order group is not rejected', () => {
    const pendingOrderGroup = getOrderGroupOfRecipeData;
    pendingOrderGroup.recipe_order_group.status = 'orders_group.status.81';
    ordersGroupOfRecipeSpy.and.returnValue(fakeAsyncResponse(pendingOrderGroup));
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      ordersGroupOfRecipeSpy.calls.mostRecent().returnValue.subscribe(res => {
        expect(component.showGenerateOrders).toBeFalsy();
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-btn button.start');
        expect(button).toBeNull();
      });
    });
  });

  describe('after init', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load order group table data', () => {
      fixture.whenStable().then(() => {
        expect(component.singleDataSource.body).toEqual([getOrderGroupOfRecipeData.recipe_order_group]);
      });
    });

    it('should load orders table data on init', () => {
      fixture.whenStable().then(() => {
        expect(component.listDataSource.body).toEqual(getAllOrdersByGroupIdData.recipe_orders);
        expect(component.listDataSource.footer).toEqual(getAllOrdersByGroupIdData.footer);
        expect(component.count).toEqual(getAllOrdersByGroupIdData.count);
      });
    });

    it('should set header LOV observables for orders table specified columns', () => {
      const headerLovColumns = ['id', 'instrument', 'side', 'exchange', 'status'];

      fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
    });

    it('should load timeline data on Init', () => {
      expect(timelineSpy).toHaveBeenCalled();
      expect(component.timeline$).not.toBeNull();
    });

    it('should open rationale modal on order group table button "read" press', () => {
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

    it('should show approve/reject buttons in order group table if order group status is pending', () => {
      const tables = fixture.nativeElement.querySelectorAll('app-data-table');
      fixture.whenStable().then(() => {
        component.singleDataSource.body[0].status = 'orders_group.status.81';
        fixture.detectChanges();
        const confirmButton = tables[0].querySelector('table tbody tr app-confirm-cell a.true');
        const rejectButton = tables[0].querySelector('table tbody tr app-confirm-cell a.false');
        expect(confirmButton).not.toBeNull();
        expect(rejectButton).not.toBeNull();
     });
    });

    it('should update all data on "generate orders" button press', fakeAsync(() => {
      component.showGenerateOrders = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('app-btn button.start');
      ordersGroupOfRecipeSpy.calls.reset();
      ordersOfGroupSpy.calls.reset();
      click(button);
      tick();
      expect(generateOrdersSpy).toHaveBeenCalled();
      expect(ordersGroupOfRecipeSpy).toHaveBeenCalled();
      expect(ordersOfGroupSpy).toHaveBeenCalled();
    }));

    it('should navigate to execution orders on orders table row click', () => {
      const tables = fixture.nativeElement.querySelectorAll('app-data-table');
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const tableRow = tables[1].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).toHaveBeenCalledWith([`/run/execution-order/${getAllOrdersByGroupIdData.recipe_orders[0].id}`]);
      });
    });
  });
});
