import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { ExecutionOrdersModule } from '../execution-orders.module';
import { ExecutionOrderListComponent } from './execution-order-list.component';
import { ExecutionOrdersService } from '../../../services/execution-orders/execution-orders.service';
import { getAllExecutionOrdersData } from '../../../testing/service-mock/executionOrders.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';


describe('ExecutionOrderListComponent', () => {
  let component: ExecutionOrderListComponent;
  let fixture: ComponentFixture<ExecutionOrderListComponent>;
  let executionOrdersService: ExecutionOrdersService;
  let navigateSpy;
  let getExecutionOrdersDataSpy;
  let headerLovColumns: Array<string>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExecutionOrdersModule,
        ...extraTestingModules
      ],
      providers: [
        ExecutionOrdersService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderListComponent);
    component = fixture.componentInstance;
    headerLovColumns = ['instrument', 'side', 'exchange', 'type', 'status' ];
    executionOrdersService = fixture.debugElement.injector.get(ExecutionOrdersService);
    getExecutionOrdersDataSpy = spyOn (executionOrdersService, 'getAllExecutionOrders').and.returnValue(
      fakeAsyncResponse(getAllExecutionOrdersData));
    navigateSpy = spyOn(component.router, 'navigate');

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load execution orders table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.orderDataSource.body).toEqual(getAllExecutionOrdersData.execution_orders);
      expect(component.orderDataSource.footer).toEqual(getAllExecutionOrdersData.footer);
      expect(component.count).toEqual(getAllExecutionOrdersData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    fixture.whenStable().then(() => testHeaderLov(component.orderDataSource, headerLovColumns));
  });

  it('should be navigated to investment run execution orders step on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/run/execution-order-fill/', getAllExecutionOrdersData.execution_orders[0].id]);
    });
  });

});
