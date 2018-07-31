import { TestBed, inject } from '@angular/core/testing';

import { DepositService } from './deposit.service';

describe('DepositService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DepositService]
    });
  });

  it('should be created', inject([DepositService], (service: DepositService) => {
    expect(service).toBeTruthy();
  }));
});
