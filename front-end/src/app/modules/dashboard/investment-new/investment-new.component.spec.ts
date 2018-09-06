import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { InvestmentNewComponent } from './investment-new.component';
import { DashboardModule } from '../dashboard.module';
import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { InvestmentService } from '../../../services/investment/investment.service';


const ModelConstantsServiceStub = {
  getGroup: () => {
    return fakeAsyncResponse({
      STRATEGY_TYPES: {
        MCI: 101,
        LCI: 102
      }
    });
  }
};

const InvestmentServiceStub = {};


describe('InvestmentNewComponent', () => {
  let component: InvestmentNewComponent;
  let fixture: ComponentFixture<InvestmentNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DashboardModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ModelConstantsService, useValue: ModelConstantsServiceStub },
        { provide: InvestmentService, useValue: InvestmentServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
