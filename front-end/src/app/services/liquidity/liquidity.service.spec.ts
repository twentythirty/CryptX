import { TestBed, inject } from '@angular/core/testing';

import { LiquidityService } from './liquidity.service';

describe('LiquidityRequirementsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LiquidityService]
    });
  });

  it('should be created', inject([LiquidityService], (service: LiquidityService) => {
    expect(service).toBeTruthy();
  }));
});
