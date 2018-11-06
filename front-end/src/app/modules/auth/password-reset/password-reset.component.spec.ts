import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { extraTestingModules, fakeAsyncResponse, click, errorResponse, newEvent } from '../../../testing/utils';

import { AuthModule } from '../auth.module';
import { PasswordResetComponent } from './password-reset.component';
import { AuthService } from '../../../services/auth/auth.service';
import { testFormControlForm } from '../../../testing/commonTests';
import { checkResetTokenValidityData, resetPasswordData } from '../../../testing/service-mock/auth.service.mock';


describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let authService: AuthService;
  let checkResetTokenValiditySpy;
  let resetPasswordSpy;
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

  beforeEach((done) => {
    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    authService = fixture.debugElement.injector.get(AuthService);
    checkResetTokenValiditySpy = spyOn(authService, 'checkResetTokenValidity').and.returnValue(fakeAsyncResponse(checkResetTokenValidityData));
    resetPasswordSpy = spyOn(authService, 'resetPassword').and.returnValue(fakeAsyncResponse(resetPasswordData));
    navigateSpy = spyOn(fixture.debugElement.injector.get(Router), 'navigate');
    fixture.detectChanges();

    checkResetTokenValiditySpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show password change form if token is invalid', () => {
    checkResetTokenValiditySpy.and.returnValue(errorResponse);
    component.checkResetTokenValidity();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeFalsy('form not hidden');
  });

  it('should show password change form if token is valid', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy('form is hidden');
  });

  it('should get error message if passwords are not equal', () => {
    fillPasswordChangeForm('pass', 'pass2');

    const submitButton = fixture.nativeElement.querySelector('form [type="submit"]');
    click(submitButton);
    fixture.detectChanges();

    const errorCont: HTMLElement = fixture.nativeElement.querySelector('form > p');
    expect(errorCont.innerText).toBeTruthy('no error provided');
  });

  it('should be navigated to dashboard if passwords are equal', () => {
    fillPasswordChangeForm('pass', 'pass');

    const submitButton = fixture.nativeElement.querySelector('form [type="submit"]');
    click(submitButton);
    fixture.detectChanges();

    resetPasswordSpy.calls.mostRecent().returnValue.subscribe(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });
  });


  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.resetForm,
      submitButton: () => fixture.nativeElement.querySelector('.login-block form [type="submit"]'),
      fillForm: () => {
        fillPasswordChangeForm('pass', 'pass');
      },
      changeToUnsuccess: () => {
        resetPasswordSpy.and.returnValue(errorResponse);
      }
    };
  });


  function fillPasswordChangeForm(pass: string, pass2: string) {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    inputs[0].value = pass;
    inputs[0].dispatchEvent(newEvent('input'));
    inputs[1].value = pass2;
    inputs[1].dispatchEvent(newEvent('input'));
    fixture.detectChanges();

  }
});
