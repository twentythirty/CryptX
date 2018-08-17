import { TestBed, inject } from '@angular/core/testing';

import { ColdStorageService } from './cold-storage.service';

describe('ColdStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColdStorageService]
    });
  });

  it('should be created', inject([ColdStorageService], (service: ColdStorageService) => {
    expect(service).toBeTruthy();
  }));
});
