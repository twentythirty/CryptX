import { TestBed, inject } from '@angular/core/testing';

import { InviteService } from './invite.service';
import { HttpClientModule } from '@angular/common/http';

describe('InviteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InviteService
      ],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', inject([InviteService], (service: InviteService) => {
    expect(service).toBeTruthy();
  }));
});
