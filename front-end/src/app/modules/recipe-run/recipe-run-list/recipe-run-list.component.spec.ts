import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { RecipeRunListComponent } from './recipe-run-list.component';
import { RecipeRunModule } from '../recipe-run.module';
import { RecipeRunsService } from '../../../services/recipe-runs/recipe-runs.service';


const RecipeRunsServiceStub = {
  getHeaderLOV: () => {
    return fakeAsyncResponse({});
  },

  getAllRecipeRuns: () => {
    return fakeAsyncResponse({});
  }
};


describe('RecipeRunListComponent', () => {
  let component: RecipeRunListComponent;
  let fixture: ComponentFixture<RecipeRunListComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
