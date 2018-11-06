import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ExecutionOrdersService } from './execution-orders.service';

describe('ExecutionOrdersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExecutionOrdersService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([ExecutionOrdersService], (service: ExecutionOrdersService) => {
    expect(service).toBeTruthy();
  }));
});
