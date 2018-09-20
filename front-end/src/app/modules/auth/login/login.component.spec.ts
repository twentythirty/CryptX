import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, click, errorResponse, newEvent, fakeAsyncResponse } from '../../../testing/utils';

import { AuthModule } from '../auth.module';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth/auth.service';
import { postUserLoginResponse } from '../../../testing/api-response/postUserLoginResponse.mock';
import { postSendResetTokenResponse } from '../../../testing/api-response/postSendResetTokenResponse.mock';
import { testFormControlForm } from '../../../testing/commonTests';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let authenticateSpy;
  let requestPasswordResetSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AuthModule,
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = fixture.debugElement.injector.get(AuthService);
    authenticateSpy = spyOn(authService, 'authenticate').and.returnValue(fakeAsyncResponse(postUserLoginResponse));
    requestPasswordResetSpy = spyOn(authService, 'requestPasswordReset');
    navigateSpy = spyOn(component.router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message if login failed', () => {
    authenticateSpy.and.returnValue(errorResponse);

    fillLoginForm('test@domain.com', 'password');

    const loginSubmitButton = fixture.nativeElement.querySelector('.login-block form [type="submit"]');
    click(loginSubmitButton);
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.login-block form > p');
    expect(error.innerText).toBeTruthy('no error message found');
  });

  it('should navigate to dashboard on successful login', () => {
    authenticateSpy.and.returnValue(fakeAsyncResponse(postUserLoginResponse));

    fillLoginForm('test@domain.com', 'password');

    const loginSubmitButton = fixture.nativeElement.querySelector('.login-block form [type="submit"]');
    click(loginSubmitButton);

    authenticateSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  it('should show "forgot password" modal on when click "forgot password" link', () => {
    const forgotPassButton = fixture.nativeElement.querySelector('.forgot-pass');
    click(forgotPassButton);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-modal');
    expect(modal).toBeTruthy();
  });

  it('should show confirmation message when forgot password form is submited', () => {
    requestPasswordResetSpy.and.returnValue(fakeAsyncResponse(postSendResetTokenResponse));

    component.showPassReset();
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('app-modal');
    const input = modal.querySelector('form input');
    input.value = 'test@domain.com';
    input.dispatchEvent(newEvent('input'));

    const submitButton = modal.querySelector('form [type="submit"]');
    click(submitButton);

    requestPasswordResetSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();

      const modalForm = modal.querySelector('form');
      const msgBlock = modal.querySelector('.confirmation-message');
      expect(modalForm).toBeFalsy('form should be hidden');
      expect(msgBlock).toBeTruthy('confirmation message not found');
    });
  });

  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.loginForm,
      submitButton: fixture.nativeElement.querySelector('.login-block form [type="submit"]'),
      fillForm: () => {
        fillLoginForm('test@domain.com', 'pass');
      },
      changeToUnsuccess: () => {
        authenticateSpy.and.returnValue(errorResponse);
      }
    };
  });

  function fillLoginForm(username: string, password: string) {
    const input = fixture.nativeElement.querySelector('.login-block form input[type="text"]');
    input.value = username;
    input.dispatchEvent(newEvent('input'));
    const input2 = fixture.nativeElement.querySelector('.login-block form input[type="password"]');
    input2.value = password;
    input2.dispatchEvent(newEvent('input'));
    fixture.detectChanges();
  }

});
