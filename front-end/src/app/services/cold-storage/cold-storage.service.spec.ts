import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { testingTranslateModule } from '../../testing/utils';

import { ColdStorageService } from './cold-storage.service';

describe('ColdStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColdStorageService],
      imports: [
        HttpClientModule,
        testingTranslateModule
      ]
    });
  });

  it('should be created', inject([ColdStorageService], (service: ColdStorageService) => {
    expect(service).toBeTruthy();
  }));
});
