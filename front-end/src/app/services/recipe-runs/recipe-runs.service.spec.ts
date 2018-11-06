import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { RecipeRunsService } from './recipe-runs.service';

describe('RecipeRunsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecipeRunsService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([RecipeRunsService], (service: RecipeRunsService) => {
    expect(service).toBeTruthy();
  }));
});
