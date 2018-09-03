import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { testingTranslateModule } from '../../utils/testing';

import { InvestmentService } from './investment.service';

describe('InvestmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvestmentService],
      imports: [
        HttpClientModule,
        testingTranslateModule
      ]
    });
  });

  it('should be created', inject([InvestmentService], (service: InvestmentService) => {
    expect(service).toBeTruthy();
  }));
});
