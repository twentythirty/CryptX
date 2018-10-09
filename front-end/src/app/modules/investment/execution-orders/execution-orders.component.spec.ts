import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { ExecutionOrdersComponent } from './execution-orders.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { getAllExecutionOrdersData, getTimelineData } from '../../../testing/service-mock/investment.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';


describe('ExecutionOrdersComponent', () => {
  let component: ExecutionOrdersComponent;
  let fixture: ComponentFixture<ExecutionOrdersComponent>;
  let investmentService: InvestmentService;
  let timelineSpy;
  let getAllExecutionOrdersSpy;
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
    fixture = TestBed.createComponent(ExecutionOrdersComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    timelineSpy = spyOn (investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getTimelineData));
    getAllExecutionOrdersSpy = spyOn (investmentService, 'getAllExecOrders').and.returnValue(fakeAsyncResponse(getAllExecutionOrdersData));
    navigateSpy = spyOn (component.router, 'navigate');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load execution orders table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.listDataSource.body).toEqual(getAllExecutionOrdersData.execution_orders);
      expect(component.listDataSource.footer).toEqual(getAllExecutionOrdersData.footer);
      expect(component.count).toEqual(getAllExecutionOrdersData.count);
    });
  });

  it('should load timeline data on init', () => {
    expect(timelineSpy).toHaveBeenCalled();
    expect(component.timeline$).not.toBeNull();
  });

  it('should set header LOV observables for execution orders table specified columns', () => {
    const headerLovColumns = ['id', 'instrument', 'side', 'exchange', 'type', 'status'];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });

  it('should navigate to execution orders fills on execution orders table row click', () => {
    const tables = fixture.nativeElement.querySelectorAll('app-data-table');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = tables[0].querySelector('table tbody tr');
        click(tableRow);
        expect(navigateSpy).toHaveBeenCalledWith([`/run/execution-order-fill/${getAllExecutionOrdersData.execution_orders[0].id}`]);
    });
  });

});
