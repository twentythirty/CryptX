import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeRunListComponent } from './recipe-run-list.component';

describe('RecipeRunListComponent', () => {
  let component: RecipeRunListComponent;
  let fixture: ComponentFixture<RecipeRunListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecipeRunListComponent ]
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
