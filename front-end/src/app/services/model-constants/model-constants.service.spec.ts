import { TestBed, inject } from '@angular/core/testing';

import { ModelConstantsService } from './model-constants.service';

describe('ModelConstantsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModelConstantsService]
    });
  });

  it('should be created', inject([ModelConstantsService], (service: ModelConstantsService) => {
    expect(service).toBeTruthy();
  }));
});
