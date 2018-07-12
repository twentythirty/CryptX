import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeRunDetailComponent } from './recipe-run-detail.component';

describe('RecipeRunDetailComponent', () => {
  let component: RecipeRunDetailComponent;
  let fixture: ComponentFixture<RecipeRunDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecipeRunDetailComponent ]
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
