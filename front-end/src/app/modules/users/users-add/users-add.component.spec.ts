import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, errorResponse } from '../../../testing/utils';

import { UsersModule } from '../users.module';
import { UsersAddComponent } from './users-add.component';
import { RolesService } from '../../../services/roles/roles.service';
import { UsersService } from '../../../services/users/users.service';
import { getAllRolesData } from '../../../testing/service-mock/roles.service.mock';
import { testFormControlForm } from '../../../testing/commonTests';
import { sendInviteResponseData } from '../../../testing/service-mock/users.service.mock';


describe('UsersAddComponent', () => {
  let component: UsersAddComponent;
  let fixture: ComponentFixture<UsersAddComponent>;
  let rolesService: RolesService;
  let usersService: UsersService;
  let getRolesDataSpy;
  let sendInviteSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UsersModule,
        ...extraTestingModules
      ],
      providers: [
        RolesService,
        UsersService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAddComponent);
    component = fixture.componentInstance;
    rolesService = fixture.debugElement.injector.get(RolesService);
    usersService = fixture.debugElement.injector.get(UsersService);
    getRolesDataSpy = spyOn(rolesService, 'getAllRoles').and.returnValue(fakeAsyncResponse(getAllRolesData));
    sendInviteSpy = spyOn (usersService, 'sendInvite').and.returnValue(
      fakeAsyncResponse(sendInviteResponseData));
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

  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.userForm,
      submitButton: fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        component.userForm.controls.first_name.setValue('Name');
        component.userForm.controls.last_name.setValue('Surname');
        component.userForm.controls.email.setValue('NewEmail@email.com');
        component.userForm.controls.role_id.setValue([1, 10]);
        fixture.detectChanges();
      },
      changeToUnsuccess: () => {
        sendInviteSpy.and.returnValue(fakeAsyncResponse(errorResponse));
      }
    };
  });

});
