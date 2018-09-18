import { async, ComponentFixture, TestBed} from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { OrdersModule } from '../orders.module';
import { OrdersListComponent } from './orders-list.component';
import { OrdersService, OrdersAllResponse} from '../../../services/orders/orders.service';
import { Order } from '../../../shared/models/order';
import {async as _async} from 'rxjs/scheduler/async';
import { RouterTestingModule } from '@angular/router/testing';
import { testHeaderLov } from '../../../testing/commonTests';

const allOrdersDetailedResponse: OrdersAllResponse = {
  success: true,
  recipe_orders: [
    new Order({
      completed_timestamp: 1535629504367,
      created_timestamp: 1535519367429,
      exchange: 'Binance',
      id: 404,
      instrument: 'ZEC/BTC',
      instrument_id: 3875,
      investment_id: 38,
      price: '0.02153',
      quantity: '42.224',
      recipe_order_group_id: 35,
      recipe_run_id: 67,
      side: 'orders.side.999',
      status: 'orders.status.53',
      sum_of_exchange_trading_fee: '3.64817800000000000000',
      target_exchange_id: 1
    }),
  ],
  footer: [{
    name: 'id',
    value: '358',
    template: 'recipe_orders.footer.id',
    args: {id: '358'}
  }],
  count: 1
};

const OrdersServiceStub = {
  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  },
  getAllOrders: () => {
    return fakeAsyncResponse(allOrdersDetailedResponse);
  }
};


describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OrdersModule,
       RouterTestingModule.withRoutes([]),
        ...extraTestingModules,
      ],
      providers: [
         { provide: OrdersService, useValue: OrdersServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load orders table data on init', () => {
    OrdersServiceStub.getAllOrders().subscribe(res => {
      expect(component.ordersDataSource.body).toEqual(res.recipe_orders);
      expect(component.ordersDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(res.count);
    });
  });

  it('should be navigated to execution orders page of selected order', () => {
    const navigateSpy = spyOn(component.router, 'navigate');

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      component.openRow(allOrdersDetailedResponse.recipe_orders[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/run/execution-order', allOrdersDetailedResponse.recipe_orders[0].id]);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['instrument', 'side', 'exchange', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.ordersDataSource, headerLovColumns));
  });
});
