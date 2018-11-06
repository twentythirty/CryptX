import { async, ComponentFixture, TestBed} from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click} from '../../../testing/utils';

import { OrdersModule } from '../orders.module';
import { OrdersListComponent } from './orders-list.component';
import { OrdersService } from '../../../services/orders/orders.service';
import { testHeaderLov } from '../../../testing/commonTests';
import { getAllOrdersData } from '../../../testing/service-mock/orders.service.mock';


describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;
  let headerLovColumns: Array<string>;
  let ordersService: OrdersService;
  let getAllOrdersSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OrdersModule,
        ...extraTestingModules,
      ],
      providers: [
        OrdersService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
    headerLovColumns = ['instrument', 'side', 'exchange', 'status'];
    navigateSpy = spyOn(component.router, 'navigate');
    ordersService = fixture.debugElement.injector.get(OrdersService);
    getAllOrdersSpy = spyOn(ordersService, 'getAllOrders').and.returnValue(fakeAsyncResponse(getAllOrdersData));


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load orders table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.ordersDataSource.body).toEqual(getAllOrdersData.recipe_orders);
      expect(component.ordersDataSource.footer).toEqual(getAllOrdersData.footer);
      expect(component.count).toEqual(getAllOrdersData.count);
    });
  });

  it('should be navigated to execution orders page of selected order', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/run/execution-order', getAllOrdersData.recipe_orders[0].id]);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    fixture.whenStable().then(() => testHeaderLov(component.ordersDataSource, headerLovColumns));
  });
});
