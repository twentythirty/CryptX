import { TestBed, inject } from '@angular/core/testing';

import { InvestmentService } from './investment.service';

describe('InvestmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvestmentService]
    });
  });

  it('should be created', inject([InvestmentService], (service: InvestmentService) => {
    expect(service).toBeTruthy();
  }));
});
