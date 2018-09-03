import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { OrdersModule } from '../orders.module';
import { OrdersListComponent } from './orders-list.component';
import { OrdersService } from '../../../services/orders/orders.service';


const OrdersServiceStub = {
  getHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getAllOrders: () => {
    return fakeAsyncResponse({});
  }
};


describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OrdersModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: OrdersService, useValue: OrdersServiceStub }
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
});
