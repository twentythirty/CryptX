import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ExchangesService } from './exchanges.service';

describe('LiquidityRequirementsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExchangesService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([ExchangesService], (service: ExchangesService) => {
    expect(service).toBeTruthy();
  }));
});
