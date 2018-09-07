import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { ExecutionOrdersModule } from '../execution-orders.module';
import { ExecutionOrderListComponent } from './execution-order-list.component';
import { ExecutionOrdersService, OrderAllResponse } from '../../../services/execution-orders/execution-orders.service';


const ExecutionOrdersServiceStub = {
  getAllExecutionOrders: () => {
    return fakeAsyncResponse<OrderAllResponse>({
      success: true,
      execution_orders: [
        {
          id: 50117,
          investment_run_id: 28,
          recipe_order_id: 189,
          instrument_id: 3872,
          instrument: 'XEM/BTC',
          side: 'execution_orders.side.999',
          exchange_id: 1,
          exchange: 'Binance',
          type: 'execution_orders.type.71',
          price: null,
          total_quantity: '335',
          exchange_trading_fee: null,
          status: 'execution_orders.status.62',
          submission_time: 1535711110007,
          completion_time: null
        },
      ],
      footer: [],
      count: 1
    });
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('ExecutionOrderListComponent', () => {
  let component: ExecutionOrderListComponent;
  let fixture: ComponentFixture<ExecutionOrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExecutionOrdersModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ExecutionOrdersService, useValue: ExecutionOrdersServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load deposits on init', () => {
    ExecutionOrdersServiceStub.getAllExecutionOrders().subscribe(res => {
      expect(component.orderDataSource.body).toEqual(res.execution_orders);
      expect(component.orderDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

});
