import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click, newEvent } from '../../../testing/utils';

import { InvestmentModule } from '../investment.module';
import { RecipeRunDetailComponent } from './recipe-run-detail.component';
import { InvestmentService } from '../../../services/investment/investment.service';
import { testHeaderLov } from '../../../testing/commonTests';
import { getAllTimelineDataData,
         getSingleRecipeData,
         getAllRecipeDetailsData,
         approveRecipeResponse } from '../../../testing/service-mock/investment.service.mock';


describe('RecipeRunDetailComponent', () => {
  let component: RecipeRunDetailComponent;
  let fixture: ComponentFixture<RecipeRunDetailComponent>;
  let investmentService: InvestmentService;
  let timelineSpy;
  let getSingleRecipeSpy;
  let getAllRecipeDetailsSpy;
  let approveSpy;


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
    fixture = TestBed.createComponent(RecipeRunDetailComponent);
    component = fixture.componentInstance;
    investmentService = fixture.debugElement.injector.get(InvestmentService);
    approveSpy = spyOn(investmentService, 'approveRecipe').and.returnValue(fakeAsyncResponse(approveRecipeResponse));
    getSingleRecipeSpy = spyOn (investmentService, 'getSingleRecipe').and.returnValue(fakeAsyncResponse(getSingleRecipeData));
    getAllRecipeDetailsSpy = spyOn (investmentService, 'getAllRecipeDetails').and.returnValue(fakeAsyncResponse(getAllRecipeDetailsData));
    timelineSpy = spyOn ( investmentService, 'getAllTimelineData').and.returnValue(fakeAsyncResponse(getAllTimelineDataData.timeline));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipe run table data on init', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.singleDataSource.body).toEqual([getSingleRecipeData.recipe_run]);
    });
  });

  it('should load recipe run details table data on init', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.listDataSource.body).toEqual(getAllRecipeDetailsData.recipe_details);
      expect(component.listDataSource.footer).toEqual(getAllRecipeDetailsData.footer);
      expect(component.count).toEqual(getAllRecipeDetailsData.count);
    });
  });

  it('should load timeline data on init', () => {
    fixture.detectChanges();
    expect(timelineSpy).toHaveBeenCalled();
    expect(component.timeline$).not.toBeNull();
  });

  it('should set header LOV observables for recipe run details table specified columns', () => {
    const headerLovColumns = ['id', 'transaction_asset', 'quote_asset', 'target_exchange'];

    fixture.whenStable().then(() => testHeaderLov(component.listDataSource, headerLovColumns));
  });

  describe('if recipe status is pending', () => {
    beforeEach((done) => {
      const pendingRecipe = Object.assign({}, getSingleRecipeData);
      pendingRecipe.recipe_run.approval_status = 'recipes.status.41';
      getSingleRecipeSpy.and.returnValue((fakeAsyncResponse(pendingRecipe)));
      getSingleRecipeSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });

    it('should append recipe confirm column', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const buttons = fixture.nativeElement.querySelector('app-data-table table tbody tr app-confirm-cell');
        expect(buttons).not.toBeNull();
      });
    });

    it('should open rationale modal on "approve" button click', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-data-table table tbody tr app-confirm-cell a.true');
        click(button);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();
      });
    });

    it('should open rationale modal on "reject" button click', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-data-table table tbody tr app-confirm-cell a.false');
        click(button);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();
      });
    });

    it('should not show rationale column "read" button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-data-table table tbody tr app-action-cell label');
        expect(button).toBeNull();
      });
    });

    describe('after rationale submission', () => {
      let confirmButton;
      let submitButton;
      let textarea;

      beforeEach(fakeAsync(() => {
          const confirmRecipe = Object.assign({}, getSingleRecipeData);
          confirmRecipe.recipe_run.approval_status = 'recipes.status.43';
          getSingleRecipeSpy.and.returnValue((fakeAsyncResponse(confirmRecipe)));
          fixture.detectChanges();
          confirmButton = fixture.nativeElement.querySelector('app-data-table table tbody tr app-confirm-cell a.true');
          click(confirmButton);
          fixture.detectChanges();
          submitButton = fixture.nativeElement.querySelector('app-rationale-modal app-btn button');
          textarea = fixture.nativeElement.querySelector('app-rationale-modal textarea');
          textarea.value = 'confirm text';
          textarea.dispatchEvent(newEvent('input'));
          fixture.detectChanges();
          click(submitButton);
          fixture.detectChanges();
      }));

      it('should update tables and timeline data', () => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          approveSpy.calls.mostRecent().returnValue.subscribe(res => {
            expect(timelineSpy).toHaveBeenCalled();
            expect(getSingleRecipeSpy).toHaveBeenCalled();
            expect(getAllRecipeDetailsSpy).toHaveBeenCalled();
          });
        });
      });

      it('should remove confirm column', () => {
        fixture.detectChanges();
        const confirmCell = fixture.nativeElement.querySelector('app-data-table table tbody tr app-confirm-cell');
        expect(confirmCell).toBeNull();
      });

      it('should show rationale "read" button', () => {
        fixture.detectChanges();
        const rationaleButton = fixture.nativeElement.querySelector('app-data-table table tbody tr app-action-cell label');
        expect(rationaleButton).not.toBeNull();
      });
    });
  });

  describe('if recipe status is not pending ', () => {
    beforeEach(() => {
      const rejectedRecipe = Object.assign({}, getSingleRecipeData);
      rejectedRecipe.recipe_run.approval_status = 'recipes.status.43';
      getSingleRecipeSpy.and.returnValue((fakeAsyncResponse(rejectedRecipe)));
      fixture.detectChanges();
    });

    it('should not append recipe confirm column', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-data-table table tbody tr app-confirm-cell');
        expect(button).toBeNull();
      });
    });

    it('should show rationale column "read" button', () => {
     fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('app-data-table table tbody tr app-action-cell label');
        expect(button).not.toBeNull();
      });
    });

    describe('after "read" button is pressed', () => {
      let readButton;
      let hideModalSpy;

      beforeEach(() => {
        hideModalSpy = spyOn (component, 'hideReadModal');
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          readButton = fixture.nativeElement.querySelector('app-data-table table tbody tr app-action-cell label');
          click(readButton);
        });
      });

      it ('should show rationale modal', () => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();
        });
      });

      it('should close modal after "cancel" button is pressed', () => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          const closeIcon = fixture.nativeElement.querySelector('a.close-modal');
          click(closeIcon);
          expect(hideModalSpy).toHaveBeenCalled();
        });
      });

      it('should close modal after "done" button is pressed', () => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          const doneButton = fixture.nativeElement.querySelector('app-modal app-btn button');
          click(doneButton);
          expect(hideModalSpy).toHaveBeenCalled();
        });
      });
    });
  });
});
