import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ColdStorageService } from './cold-storage.service';

describe('ColdStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColdStorageService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([ColdStorageService], (service: ColdStorageService) => {
    expect(service).toBeTruthy();
  }));
});
