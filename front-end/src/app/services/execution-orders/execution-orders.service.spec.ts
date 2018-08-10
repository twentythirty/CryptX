import { TestBed, inject } from '@angular/core/testing';

import { ExecutionOrdersService } from './execution-orders.service';

describe('ExecutionOrdersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExecutionOrdersService]
    });
  });

  it('should be created', inject([ExecutionOrdersService], (service: ExecutionOrdersService) => {
    expect(service).toBeTruthy();
  }));
});
