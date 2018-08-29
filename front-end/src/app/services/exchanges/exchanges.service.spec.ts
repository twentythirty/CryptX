import { TestBed, inject } from '@angular/core/testing';

import { ExchangesService } from './exchanges.service';

describe('LiquidityRequirementsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExchangesService]
    });
  });

  it('should be created', inject([ExchangesService], (service: ExchangesService) => {
    expect(service).toBeTruthy();
  }));
});
