import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { ExecutionOrderDetailComponent } from './execution-order-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { getSingleOrderData, getTimelineDataData } from '../../../testing/service-mock/investment.service.mock';
import { getAllExecutionOrdersData } from '../../../testing/service-mock/executionOrders.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';


describe('ExecutionOrderDetailComponent', () => {
  let component: ExecutionOrderDetailComponent;
  let fixture: ComponentFixture<ExecutionOrderDetailComponent>;
  let investmentService: InvestmentService;
  let getSingleOrderSpy;
  let getAllExecutionOrdersSpy;
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
    fixture = TestBed.createComponent(ExecutionOrderDetailComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    getSingleOrderSpy = spyOn (investmentService, 'getSingleOrder').and.returnValue(fakeAsyncResponse(getSingleOrderData));
    getAllExecutionOrdersSpy = spyOn (investmentService, 'getAllExecutionOrders').and.returnValue(fakeAsyncResponse(getAllExecutionOrdersData));
    timelineSpy = spyOn (investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getTimelineDataData));
    navigateSpy = spyOn (component.router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load order table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.singleDataSource.body).toEqual([getSingleOrderData.recipe_order]);
    });
  });

  it('should load execution orders table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.listDataSource.body).toEqual(getAllExecutionOrdersData.execution_orders);
      expect(component.listDataSource.footer).toEqual(getAllExecutionOrdersData.footer);
      expect(component.count).toEqual(getAllExecutionOrdersData.count);
    });
  });

  it('should set header LOV observables for execution orders table specified columns', () => {
    const headerLovColumns = ['id', 'instrument', 'side', 'exchange', 'type', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });

  it('should navigate to execution orders fills on execution orders table row click', () => {
    const tables = fixture.nativeElement.querySelectorAll('app-data-table');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = tables[1].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).toHaveBeenCalledWith([`/run/execution-order-fill/${getAllExecutionOrdersData.execution_orders[0].id}`]);
    });
  });

  it('should load timeline data on init', () => {
    expect(timelineSpy).toHaveBeenCalled();
    expect(component.timeline$).not.toBeNull();
  });
});
