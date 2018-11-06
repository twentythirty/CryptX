import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { RecipeRunListComponent } from './recipe-run-list.component';
import { RecipeRunModule } from '../recipe-run.module';
import { RecipeRunsService } from '../../../services/recipe-runs/recipe-runs.service';
import { testHeaderLov } from '../../../testing/commonTests';
import { getAllRecipeRunsData } from '../../../testing/service-mock/recipeRuns.service.mock';


describe('RecipeRunListComponent', () => {
  let component: RecipeRunListComponent;
  let fixture: ComponentFixture<RecipeRunListComponent>;
  let headerLovColumns;
  let recipeRunsService: RecipeRunsService;
  let getAllRecipeRunsDataSpy;
  let navigateSpy;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RecipeRunModule,
        ...extraTestingModules
      ],
      providers: [
        RecipeRunsService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeRunListComponent);
    component = fixture.componentInstance;
    recipeRunsService = fixture.debugElement.injector.get(RecipeRunsService);
    getAllRecipeRunsDataSpy = spyOn(recipeRunsService, 'getAllRecipeRuns').and.returnValue(fakeAsyncResponse(getAllRecipeRunsData));
    navigateSpy = spyOn(component.router, 'navigate');
    headerLovColumns = ['id', 'investment_run_id', 'user_created', 'approval_status', 'approval_user'];


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load recipe runs table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.recipeDataSource.body).toEqual(getAllRecipeRunsData.recipe_runs);
      expect(component.recipeDataSource.footer).toEqual(getAllRecipeRunsData.footer);
      expect(component.count).toEqual(getAllRecipeRunsData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    fixture.whenStable().then(() => testHeaderLov(component.recipeDataSource, headerLovColumns));
  });

  it('should be navigated to execution orders page of selected order', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/run/recipe/', getAllRecipeRunsData.recipe_runs[0].id]);
    });
  });

  it('should not show "read" button if recipe run is on "penging" status', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      component.recipeDataSource.body[0].approval_status = 'recipes.status.41';
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).toBeNull();
    });
  });

  it('should show "read" button if recipe run is not on "penging status"', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      component.recipeDataSource.body[0].approval_status = 'recipes.status.42';
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).not.toBeNull();
    });
  });

  describe('after click on "read" button', () => {
    beforeEach(() => {
      fixture.whenStable().then(() => {
        component.recipeDataSource.body[0].approval_status = 'recipes.status.42';
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
