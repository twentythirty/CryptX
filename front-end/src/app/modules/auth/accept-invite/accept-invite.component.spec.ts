import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse, newEvent, click } from '../../../testing/utils';

import { AuthModule } from '../auth.module';
import { AcceptInviteComponent } from './accept-invite.component';
import { InviteService } from './invite.service';
import { AuthService } from '../../../services/auth/auth.service';


const checkTokenResponse = {
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
};

const fulfillInvitationResponse = {
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
};

const InviteServiceStub = {
  checkToken: () => {
    return fakeAsyncResponse(checkTokenResponse);
  },

  fulfillInvitation: () => {
    return fakeAsyncResponse(fulfillInvitationResponse);
  }
};

const AuthServiceStub = {
  setAuthData: () => {}
};


describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;
  let inviteService: InviteService;
  let checkTokenSpy;
  let navigateSpy;
  let fulfillInvitationSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AuthModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InviteService, useValue: InviteServiceStub },
        { provide: AuthService, useValue: AuthServiceStub },
        {
          provide: ActivatedRoute, useValue: {
            queryParams: of({ token: 'fake-token' })
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
    inviteService = TestBed.get(InviteService);

    checkTokenSpy = spyOn(inviteService, 'checkToken').and.returnValue(fakeAsyncResponse(checkTokenResponse));
    fulfillInvitationSpy = spyOn(inviteService, 'fulfillInvitation').and.returnValue(fakeAsyncResponse(fulfillInvitationResponse));
    navigateSpy = spyOn(component.router, 'navigate');
    fixture.detectChanges();

    checkTokenSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('if token is invalid', () => {
    beforeEach(() => {
      checkTokenSpy.and.returnValue(
        throwError({
          error: {
            success: false,
            error: 'error message'
          }
        })
      );
    });

    it('should not show password set form if token is invalid', () => {
      component.checkTokenValidity();
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeFalsy('form element is defined');
    });
  });

  it('should show password set form if token is valid', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy('form element not found');
  });

  it('should get error message if passwords are not equal', () => {
    fillPasswordsAndSubmit('pass', 'pass2');

    fixture.detectChanges();
    const errorCont = fixture.nativeElement.querySelector('form > p');
    expect(errorCont.innerText).toBeTruthy('no error message found');
  });

  it('should be navigated to dashboard if passwords are equal', () => {
    fillPasswordsAndSubmit('pass', 'pass');

    fulfillInvitationSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        const submitButton = fixture.nativeElement.querySelector('form button[type=submit]');
        click(submitButton);

        expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });


  function fillPasswordsAndSubmit(pass1: string, pass2: string) {
    const inputs = fixture.nativeElement.querySelectorAll('form input[type="password"]');
    inputs[0].value = pass1;
    inputs[0].dispatchEvent(newEvent('input'));
    inputs[1].value = pass2;
    inputs[1].dispatchEvent(newEvent('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('form button[type="submit"]');
    click(submitButton);
  }

});
