import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { testingTranslateModule } from '../../utils/testing';

import { AssetService } from './asset.service';

describe('AssetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetService],
      imports: [
        HttpClientModule,
        testingTranslateModule
      ]
    });
  });

  it('should be created', inject([AssetService], (service: AssetService) => {
    expect(service).toBeTruthy();
  }));
});
