import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse, newEvent, click } from '../../../testing/utils';

import { AuthModule } from '../auth.module';
import { AcceptInviteComponent } from './accept-invite.component';
import { InviteService } from './invite.service';
import { AuthService } from '../../../services/auth/auth.service';


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

const AuthServiceStub = {
  setAuthData: () => {

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

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
    inviteService = TestBed.get(InviteService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('if token is invalid', () => {
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
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeFalsy('form element is defined');
    });
  });

  it('should show password set form if token is valid', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy('form element not found');
    });
  });

  it('should get error message if passwords are not equal', () => {
    fillPasswordsAndSubmit('pass', 'pass2');

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const errorCont = fixture.nativeElement.querySelector('form > p');
      expect(errorCont.innerText).toBeTruthy('no error message found');
    });
  });

  fit('should be navigated to dashboard if passwords are equal', fakeAsync(() => {
    // fillPasswordsAndSubmit('pass', 'pass');
    console.log('component', component);
    console.log('component.router', component.router);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const inputs = fixture.nativeElement.querySelectorAll('form input[type=password]');
      console.log('inputs', inputs);
      inputs[0].value = 'pass';
      inputs[0].dispatchEvent(newEvent('input'));
      inputs[1].value = 'pass';
      inputs[1].dispatchEvent(newEvent('input'));
      fixture.detectChanges();

      console.log('before ');
      fixture.whenStable().then(() => {
        const navigateSpy = spyOn(component.router, 'navigate');
        // component.router.navigate(['dashboard']);
        const submitButton = fixture.nativeElement.querySelector('form button[type=submit]');
        console.log(submitButton);
        click(submitButton);
        // component.fulfillInvitation();

        // fixture.detectChanges();
        console.log('before expect');
        expect(navigateSpy).toHaveBeenCalledWith(['asasasasa']);
      });
    });

    // fixture.whenStable().then(() => {
    //   fixture.detectChanges();
    //   expect(navigateSpy).toHaveBeenCalled();
    // });
  }));


  function fillPasswordsAndSubmit(pass1: string, pass2: string) {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const inputs = fixture.nativeElement.querySelectorAll('form input[type=password]');
      inputs[0].value = pass1;
      inputs[0].dispatchEvent(newEvent('input'));
      inputs[1].value = pass2;
      inputs[1].dispatchEvent(newEvent('input'));
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('form button[type=submit]');
      click(submitButton);
    });
  }
});
