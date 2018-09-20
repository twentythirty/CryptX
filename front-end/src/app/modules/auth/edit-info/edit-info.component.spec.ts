import { async, ComponentFixture, TestBed, } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, newEvent, click, errorResponse } from '../../../testing/utils';
import { testFormControlForm, testFormErrorMessagesRendering } from '../../../testing/commonTests';

import { AuthModule } from '../auth.module';
import { EditInfoComponent } from './edit-info.component';
import { AuthService } from '../../../services/auth/auth.service';
import { changeInfoData } from '../../../testing/service-mock/auth.service.mock';


describe('EditInfoComponent', () => {
  let component: EditInfoComponent;
  let fixture: ComponentFixture<EditInfoComponent>;
  let authService: AuthService;
  let changeInfoSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AuthModule,
        ...extraTestingModules
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInfoComponent);
    component = fixture.componentInstance;
    authService = fixture.debugElement.injector.get(AuthService);
    changeInfoSpy = spyOn(authService, 'changeInfo').and.returnValue(fakeAsyncResponse(changeInfoData));
    fixture.detectChanges();
  });

  // beforeEach(() => {
  //   return new Promise((resolve, reject) => {
  //     const spy = spyOn(authService, 'checkAuth').and.returnValue(fakeAsyncResponse(checkAuthResponse));
  //     fixture.detectChanges();
  //     spy.calls.mostRecent().returnValue.subscribe(() => {
  //       fixture.detectChanges();
  //       resolve();
  //     });
  //   });
  // });
  // beforeEach((done) => {
  //   const spy = spyOn(authService, 'checkAuth').and.returnValue(fakeAsyncResponse(checkAuthResponse));
  //   fixture.detectChanges();
  //   spy.calls.mostRecent().returnValue.subscribe(() => {
  //     fixture.detectChanges();
  //     done();
  //   });
  // });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error messages if form is invalid', () => {
    const submitButton = fixture.nativeElement.querySelector('form button[type=submit]');
    click(submitButton);
    fixture.detectChanges();

    testFormErrorMessagesRendering(component.userForm, fixture);
  });

  it('should show error message if passwords are not equal', () => {
    const inputs = fixture.nativeElement.querySelectorAll('form input[type=password]');
    inputs[0].value = 'oldpass';
    inputs[0].dispatchEvent(newEvent('input'));
    inputs[1].value = 'pass';
    inputs[1].dispatchEvent(newEvent('input'));
    inputs[2].value = 'pass2';
    inputs[2].dispatchEvent(newEvent('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('form button[type=submit]');
    click(submitButton);
    fixture.detectChanges();

    const errorCont = fixture.nativeElement.querySelector('form app-content-block p');
    expect(errorCont.innerText).toBeTruthy('no error message found');
  });

  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.userForm,
      submitButton: fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        const inputs = fixture.nativeElement.querySelectorAll('form input[type=password]');
        inputs[0].value = 'oldpass';
        inputs[0].dispatchEvent(newEvent('input'));
        inputs[1].value = 'pass';
        inputs[1].dispatchEvent(newEvent('input'));
        inputs[2].value = 'pass';
        inputs[2].dispatchEvent(newEvent('input'));

        fixture.detectChanges();
      },
      changeToUnsuccess: () => {
        changeInfoSpy.and.returnValue(errorResponse);
      }
    };
  });

});
