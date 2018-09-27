import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { UsersModule } from '../users.module';
import { UsersInfoComponent } from './users-info.component';
import { UsersService } from '../../../services/users/users.service';
import { RolesService } from '../../../services/roles/roles.service';
import { getUserData, userEditResponse, userEditFailed } from '../../../testing/service-mock/users.service.mock';
import { testFormControlForm } from '../../../testing/commonTests';
import { getAllRolesData } from '../../../testing/service-mock/roles.service.mock';


describe('UsersAddComponent', () => {
  let component: UsersInfoComponent;
  let fixture: ComponentFixture<UsersInfoComponent>;
  let usersService: UsersService;
  let rolesService: RolesService;
  let getAllRolesSpy;
  let getUserDataSpy;
  let editUserSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UsersModule,
        ...extraTestingModules,
      ],
      providers: [
        UsersService,
        RolesService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersInfoComponent);
    component = fixture.componentInstance;
    usersService = fixture.debugElement.injector.get(UsersService);
    rolesService = fixture.debugElement.injector.get(RolesService);
    getAllRolesSpy = spyOn (rolesService, 'getAllRoles').and.returnValue(fakeAsyncResponse(getAllRolesData));
    getUserDataSpy = spyOn (usersService, 'getUser').and.returnValue(fakeAsyncResponse(getUserData));
    editUserSpy = spyOn (usersService, 'saveUser').and.returnValue(fakeAsyncResponse(userEditResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles on init', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.rolelist.length).toEqual(getAllRolesData.count);
    });
  });

  it('should put user data to input fields on init', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.userForm.controls.firstName.value).toBe(getUserData.user.first_name);
      expect(component.userForm.controls.lastName.value).toBe(getUserData.user.last_name);
      expect(component.userForm.controls.email.value).toBe(getUserData.user.email);
    });
  });

  it('should check current user permissions on init', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.userRoles).toEqual(getUserData.user.roles);
    });
  });

  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.userForm,
      submitButton: fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        component.userForm.controls.firstName.setValue('Name');
        component.userForm.controls.lastName.setValue('Surname');
        component.userForm.controls.email.setValue('NewEmail@email.com');
        component.userForm.controls.roleId.setValue([1, 2]);
        fixture.detectChanges();
      },
      changeToUnsuccess: () => {
        editUserSpy.and.returnValue(fakeAsyncResponse(userEditFailed));
      }
    };
  });

  it ('should not open deactivate/activate confirm modal if form is invalid', () => {
    fixture.whenStable().then(() => {
      component.userId = getUserData.user.id;
      // make form invalid
      component.userForm.controls.roleId.setValue([]);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button.deactive');
      click(button);
      fixture.detectChanges();
      const modal = fixture.nativeElement.querySelector('app-confirm');
      expect(modal).toBeNull('Modal is not opened');
    });
  });

  it('should open deactivate/activate confirm modal if form is valid', () => {
    fixture.whenStable().then(() => {
      component.userId = getUserData.user.id;
      // make form valid
      component.userForm.controls.roleId.setValue([1, 2]);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button.deactive');
      click(button);
      fixture.detectChanges();
      const modal = fixture.nativeElement.querySelector('app-confirm');
      expect(modal).not.toBeNull('Modal is opened');
    });
  });

  describe ('after deactivate/activate modal is opened', () => {
    let modal: HTMLElement;

    beforeEach(() => {
      component.showDeactivateConfirm = true;
      fixture.detectChanges();
    });

    it ('modal should be opened', () => {
      modal = fixture.nativeElement.querySelector('app-confirm');
      expect(modal).not.toBeNull('Modal is opened');
    });

    it ('should close modal if button "cancel" is pressed', () => {
      const modalButton = fixture.nativeElement.querySelector('app-btn.reject');
      click(modalButton);
      fixture.detectChanges();
      modal = fixture.nativeElement.querySelector('app-confirm');
      expect(component.showDeactivateConfirm).toBe(false);
      expect(modal).toBeNull('Modal is closed');
    });

    describe ('after "confirm" button is pressed', () => {
      let confirmButton: HTMLElement;
      let deactivateSpy;
      let navigateSpy;

      beforeEach(() => {
        confirmButton = fixture.nativeElement.querySelector('app-btn.confirm');
        deactivateSpy = spyOn(component, 'deactivateUser');
        navigateSpy = spyOn(component.router, 'navigate');
        click(confirmButton);

        fixture.detectChanges();
      });

      it('should navigate to users list on successful response', () => {
        fixture.whenStable().then(() => {
          // make form valid
          component.userForm.controls.roleId.setValue([1, 2]);
          fixture.detectChanges();
          expect(deactivateSpy).toHaveBeenCalled();
          editUserSpy.and.returnValue(fakeAsyncResponse(userEditResponse));
          component.saveUser();
          expect(editUserSpy).toHaveBeenCalled();
          editUserSpy.calls.mostRecent().returnValue.subscribe(res => {
            fixture.detectChanges();
            expect(navigateSpy).toHaveBeenCalledWith(['/users']);
          });
        });
      });

      it('should not navigate to users list on unsuccessful response', () => {
        fixture.whenStable().then(() => {
          // make form valid
          component.userForm.controls.roleId.setValue([1, 2]);
          fixture.detectChanges();
          expect(deactivateSpy).toHaveBeenCalled();
          editUserSpy.and.returnValue(fakeAsyncResponse(userEditFailed));
          component.saveUser();
          editUserSpy.calls.mostRecent().returnValue.subscribe(res => {
            fixture.detectChanges();
            expect(navigateSpy).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
