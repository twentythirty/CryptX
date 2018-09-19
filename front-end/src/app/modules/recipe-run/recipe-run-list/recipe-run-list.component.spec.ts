import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { RecipeRunListComponent } from './recipe-run-list.component';
import { RecipeRunModule } from '../recipe-run.module';
import { RecipeRunsService, RecipeAllResponse } from '../../../services/recipe-runs/recipe-runs.service';
import { Recipe } from '../../../shared/models/recipe';
import { testHeaderLov } from '../../../testing/commonTests';

const allRecipesDetailedResponse: RecipeAllResponse = {
  success: true,
  recipe_runs: [
    new Recipe ({
      approval_comment: 'Good recipe.',
      approval_status: 'recipes.status.42',
      approval_timestamp: 1537278661290,
      approval_user: 'Tautvydas Petkunas',
      approval_user_id: 3,
      created_timestamp: 1537278593777,
      id: 129,
      investment_run_id: 86,
      user_created: 'Tautvydas Petkunas',
      user_created_id: 3
    }),
  ],
  footer: [{
    name: 'id',
    value: '358',
    template: 'recipe_orders.footer.id',
    args: {id: '358'}
  }],
  count: 1
};

const RecipeRunsServiceStub = {
  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  },

  getAllRecipeRuns: () => {
    return fakeAsyncResponse(allRecipesDetailedResponse);
  }
};


describe('RecipeRunListComponent', () => {
  let component: RecipeRunListComponent;
  let fixture: ComponentFixture<RecipeRunListComponent>;
  let dataService: RecipeRunsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RecipeRunModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: RecipeRunsService, useValue: RecipeRunsServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeRunListComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(RecipeRunsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load recipe runs table data on init', () => {
    RecipeRunsServiceStub.getAllRecipeRuns().subscribe(res => {
      expect(component.recipeDataSource.body).toEqual(res.recipe_runs);
      expect(component.recipeDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['id', 'investment_run_id', 'user_created', 'approval_status', 'approval_user'];

    fixture.whenStable().then(() => testHeaderLov(component.recipeDataSource, headerLovColumns));
  });

  it('should be navigated to execution orders page of selected order', () => {
    const navigateSpy = spyOn(component.router, 'navigate');

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/run/recipe/', allRecipesDetailedResponse.recipe_runs[0].id]);
    });
  });

  it('should not show "read" button if recipe run is on "penging" status', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      allRecipesDetailedResponse.recipe_runs[0].approval_status = 'recipes.status.41';
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).toBeNull();
    });
  });

  it('should show "read" button if recipe run is not on "penging status"', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      allRecipesDetailedResponse.recipe_runs[0].approval_status = 'recipes.status.42';
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).not.toBeNull();
    });
  });

  describe('after click on "read" button', () => {
    beforeEach(() => {
      fixture.whenStable().then(() => {
        allRecipesDetailedResponse.recipe_runs[0].approval_status = 'recipes.status.42';
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
      });
    });

    it('should open rationale modal', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const modal = fixture.nativeElement.querySelector('app-modal');
        expect(modal).not.toBeNull();
      });
    });
  });
});
