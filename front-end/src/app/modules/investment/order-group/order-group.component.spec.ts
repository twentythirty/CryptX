import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InvestmentModule } from '../investment.module';
import { OrderGroupComponent } from './order-group.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { OrdersService } from '../../../services/orders/orders.service';


const InvestmentServiceStub = {
  getAllOrdersHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  }
};

const OrdersServiceStub = {
  getOrderGroupOfRecipe: () => {
    return fakeAsyncResponse({});
  },

  getAllOrdersByGroupId: () => {
    return fakeAsyncResponse({});
  },

  generateOrders: () => {
    return fakeAsyncResponse({});
  }
};


describe('OrderGroupComponent', () => {
  let component: OrderGroupComponent;
  let fixture: ComponentFixture<OrderGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InvestmentService, useValue: InvestmentServiceStub },
        { provide: OrdersService, useValue: OrdersServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
