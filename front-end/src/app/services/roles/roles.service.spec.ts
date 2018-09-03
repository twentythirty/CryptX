import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { RolesService } from './roles.service';

describe('RolesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RolesService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([RolesService], (service: RolesService) => {
    expect(service).toBeTruthy();
  }));
});
