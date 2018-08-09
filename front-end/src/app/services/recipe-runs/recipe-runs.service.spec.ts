import { TestBed, inject } from '@angular/core/testing';

import { RecipeRunsService } from './recipe-runs.service';

describe('RecipeRunsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecipeRunsService]
    });
  });

  it('should be created', inject([RecipeRunsService], (service: RecipeRunsService) => {
    expect(service).toBeTruthy();
  }));
});
