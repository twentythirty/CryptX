import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InvestmentModule } from '../investment.module';
import { RecipeRunDetailComponent } from './recipe-run-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';


const InvestmentServiceStub = {
  getAllRecipeDetails: () => {
    return fakeAsyncResponse({});
  },

  getAllRecipeDetailsHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getSingleRecipe: () => {
    return fakeAsyncResponse({});
  },

  getAllTimelineData: () => {
    return fakeAsyncResponse({});
  },

  approveRecipe: () => {
    return fakeAsyncResponse({});
  }
};


describe('RecipeRunDetailComponent', () => {
  let component: RecipeRunDetailComponent;
  let fixture: ComponentFixture<RecipeRunDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InvestmentModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InvestmentService, useValue: InvestmentServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeRunDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
