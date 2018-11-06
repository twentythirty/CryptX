import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { ExecutionOrderFillDetailComponent } from './execution-order-fill-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { ExecutionOrdersService } from '../../../services/execution-orders/execution-orders.service';
import { getAllTimelineDataData,
         getSingleExecutionOrderData,
         getAllExecutionOrderFillsData } from '../../../testing/service-mock/investment.service.mock';
import { changeExecutionOrderStatusResponse } from '../../../testing/service-mock/executionOrders.service.mock';


describe('ExecutionOrderFillDetailComponent', () => {
  let component: ExecutionOrderFillDetailComponent;
  let fixture: ComponentFixture<ExecutionOrderFillDetailComponent>;
  let investmentService: InvestmentService;
  let executionOrdersService: ExecutionOrdersService;
  let getSingleExecutionOrderSpy;
  let getExecutionOrderFillsSpy;
  let changeExecutionOrderStatusSpy;
  let timelineSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        InvestmentService,
        ExecutionOrdersService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderFillDetailComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    executionOrdersService = fixture.debugElement.injector.get(ExecutionOrdersService);
    getSingleExecutionOrderSpy = spyOn (investmentService, 'getSingleExecutionOrder').and.returnValue(
      fakeAsyncResponse(getSingleExecutionOrderData));
    getExecutionOrderFillsSpy = spyOn (investmentService, 'getAllExecOrdersFills').and.returnValue(
      fakeAsyncResponse(getAllExecutionOrderFillsData));
    changeExecutionOrderStatusSpy = spyOn (executionOrdersService, 'changeExecutionOrderStatus').and.returnValue(
      fakeAsyncResponse(changeExecutionOrderStatusResponse));
    timelineSpy = spyOn (investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getAllTimelineDataData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load execution order table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.singleDataSource.body).toEqual([getSingleExecutionOrderData.execution_order]);
    });
  });

  it('should load execution order fills table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.listDataSource.body).toEqual(getAllExecutionOrderFillsData.execution_order_fills);
      expect(component.listDataSource.footer).toEqual(getAllExecutionOrderFillsData.footer);
      expect(component.count).toEqual(getAllExecutionOrderFillsData.count);
    });
  });

  it('should show activity log', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const actionLog = fixture.nativeElement.querySelector('app-action-log');
      expect(actionLog).not.toBeNull();
    });
  });

  it('should load timeline data on init', () => {
    expect(timelineSpy).toHaveBeenCalled();
    expect(component.timeline$).not.toBeNull();
  });

  describe('if execution order status is failed', () => {
    beforeEach((done) => {
      const failedOrder = _.cloneDeep(getSingleExecutionOrderData);
      failedOrder.execution_order.status = 'execution_orders.status.66';
      getSingleExecutionOrderSpy.and.returnValue(fakeAsyncResponse(failedOrder));
      component.getSingleData();

      getSingleExecutionOrderSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });

    it('should show "retry" button', () => {
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).toBeTruthy();
    });

    it('should change status to pending on “retry“ button click', () => {
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      click(button);
      changeExecutionOrderStatusSpy.calls.mostRecent().returnValue.subscribe(() => {
        expect(component.singleDataSource.body[0].status).toBe('execution_orders.status.61');
      });
    });
  });
});
