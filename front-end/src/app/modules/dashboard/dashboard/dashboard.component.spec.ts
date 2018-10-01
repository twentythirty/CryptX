import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { DashboardComponent } from './dashboard.component';
import { DashboardModule } from '../dashboard.module';
import { InvestmentService } from '../../../services/investment/investment.service';
import { getAllInvestmentsData } from '../../../testing/service-mock/investment.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { getStrategiesData } from '../../../testing/service-mock/modelConstants.service';


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let investmentService: InvestmentService;
  let modelConstantsService: ModelConstantsService;
  let headerLovColumns: Array<string>;
  let getAllInvestmentsDataSpy;
  let getModelConstantsDataSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DashboardModule,
        ...extraTestingModules
      ],
      providers: [
        InvestmentService,
        ModelConstantsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    modelConstantsService = fixture.debugElement.injector.get(ModelConstantsService);
    headerLovColumns = ['strategy_type', 'is_simulated', 'status'];
    getAllInvestmentsDataSpy = spyOn (investmentService, 'getAllInvestments').and.returnValue(fakeAsyncResponse(getAllInvestmentsData));
    getModelConstantsDataSpy = spyOn (modelConstantsService, 'getGroup').and. returnValue(fakeAsyncResponse(getStrategiesData));
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load investment runs table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.investmentsDataSource.body).toEqual(getAllInvestmentsData.investment_runs);
      expect(component.investmentsDataSource.footer).toEqual(getAllInvestmentsData.footer);
      expect(component.count).toEqual(getAllInvestmentsData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    fixture.whenStable().then(() => testHeaderLov(component.investmentsDataSource, headerLovColumns));
  });

  describe('after start new run button pressed ', () => {
    let modal: HTMLElement;
    let closeModalSpy;

    beforeEach(() => {
      closeModalSpy = spyOn(component, 'closeNewInvestmentModal');
      fixture.whenStable().then(() => {
        const button = fixture.nativeElement.querySelector('a.start');
        click(button);
        fixture.detectChanges();
      });
    });

    it('should open investment run modal', () => {
      fixture.whenStable().then(() => {
        modal = fixture.nativeElement.querySelector('app-investment-new');
        expect(component.showNewInvestmentModal).toBeTruthy();
        expect(modal).not.toBeNull();
      });
    });

    it('should close modal on cross button press', fakeAsync(() => {
      fixture.whenStable().then(() => {
        const closeButton = fixture.nativeElement.querySelector('a.close-modal');
        click(closeButton);
        expect(closeModalSpy).toHaveBeenCalled();
      });
      tick();
      modal = fixture.nativeElement.querySelector('app-investment-new');
      expect(component.showNewInvestmentModal).toBeFalsy();
      expect(modal).toBeNull();
    }));

  });
});
