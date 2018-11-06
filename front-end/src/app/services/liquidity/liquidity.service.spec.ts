import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { LiquidityService } from './liquidity.service';

describe('LiquidityRequirementsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LiquidityService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([LiquidityService], (service: LiquidityService) => {
    expect(service).toBeTruthy();
  }));
});
