import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { testingTranslateModule } from '../../utils/testing';

import { DepositService } from './deposit.service';

describe('DepositService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DepositService],
      imports: [
        HttpClientModule,
        testingTranslateModule
      ]
    });
  });

  it('should be created', inject([DepositService], (service: DepositService) => {
    expect(service).toBeTruthy();
  }));
});
