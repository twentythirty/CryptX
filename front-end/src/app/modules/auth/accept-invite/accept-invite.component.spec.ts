import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { AuthModule } from '../auth.module';
import { AcceptInviteComponent } from './accept-invite.component';
import { InviteService } from './invite.service';


const InviteServiceStub = {
  checkToken: () => {
    return fakeAsyncResponse({
      success: true,
      invitation: {
        id: 45,
        was_used: false,
        token: 'fake-token',
        token_expiry_timestamp: 1525424340810,
        email: 'test@domain.com',
        first_name: 'Test',
        last_name: 'User',
        role_id: 25,
        creator_id: 888
      }
    });
  },

  fulfillInvitation: () => {
    return fakeAsyncResponse({
      success: true,
      user: {
        id: 45,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@domain.com',
        created_timestamp: 1525424340810,
        reset_password_token_hash: '79054025255fb1a26e4bc422aef54eb4',
        reset_password_token_expiry_timestamp: 1525424340810,
        is_active: true
      }
    });
  }
};


describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;
  let inviteService: InviteService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AuthModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InviteService, useValue: InviteServiceStub },
        {
          provide: ActivatedRoute, useValue: {
            queryParams: of({ token: 'fake-token' })
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
    inviteService = TestBed.get(InviteService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fdescribe('if token is invalid', () => {
    beforeEach(() => {
      spyOn(inviteService, 'checkToken').and.returnValue(
        throwError({
          error: {
            success: false,
            error: 'error message'
          }
        })
      );
    });

    it('should not show password set form if token is invalid', () => {
      component.ngOnInit();
      fixture.detectChanges();
    });
  });

  it('should show password set form if token is valid', () => {

  });

  it('should get error message if passwords are not equal');
  it('should be navigated to dashboard if passwords are equal');

});
