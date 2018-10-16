import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, errorResponse, click } from '../../../testing/utils';

import { RolesAddComponent } from './roles-add.component';
import { RolesModule } from '../roles.module';
import { RolesService } from '../../../services/roles/roles.service';
import { testFormControlForm } from '../../../testing/commonTests';
import { getRoleData, getPermissionsListData, createRoleData, roleDeleteData } from '../../../testing/service-mock/roles.service.mock';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';


describe('RolesAddComponent', () => {
  let component: RolesAddComponent;
  let fixture: ComponentFixture<RolesAddComponent>;
  let rolesService;
  let getRoleSpy;
  let getPermissionsListSpy;
  let createRoleSpy;
  let editRoleSpy;
  let deleteRoleSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RolesModule,
        ...extraTestingModules
      ],
      providers: [
        RolesService,
      ]
    });
  }));

  describe('if user edit role', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ActivatedRoute, useValue: { params: of({ roleId: 1 }) }
          }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(RolesAddComponent);
      component = fixture.componentInstance;
      rolesService = fixture.debugElement.injector.get(RolesService);
      getRoleSpy = spyOn(rolesService, 'getRole').and.returnValue(fakeAsyncResponse(getRoleData));
      editRoleSpy = spyOn(rolesService, 'editRole').and.returnValue(fakeAsyncResponse(createRoleData));
      getPermissionsListSpy = spyOn(rolesService, 'getPermissionsList').and.returnValue(fakeAsyncResponse(getPermissionsListData));
      deleteRoleSpy = spyOn(rolesService, 'deleteRole').and.returnValue(fakeAsyncResponse(roleDeleteData));
      navigateSpy = spyOn(component.router, 'navigate');

      fixture.detectChanges();
    });

    it('role name should be reflected in role name input field', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('app-input-item input');
        expect(input.getAttribute('ng-reflect-model')).toEqual(getRoleData.role.name);
      });
    });

    it('should be checked permissions assigned to current role', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const checkedPermissions = fixture.nativeElement.querySelectorAll('app-checkbox[ng-reflect-checked="true"]');
        expect(checkedPermissions.length).toEqual(getRoleData.role.permissions.length);
      });
    });

    it('should show "delete" button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const deleteButton = fixture.nativeElement.querySelector('button.deactive');
        expect(deleteButton).not.toBeNull();
      });
    });

    describe('after "delete" button is pressed', () => {
      let deleteButton;
      let modal;

      beforeEach(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          deleteButton = fixture.nativeElement.querySelector('button.deactive');
          click(deleteButton);
          fixture.detectChanges();
          modal = fixture.nativeElement.querySelector('app-confirm');
        });
      });

      it('should open delete confirm modal', () => {
        fixture.whenStable().then(() => {
          expect(modal).not.toBeNull();
        });
      });

      it('should close modal after cancel button is pressed', () => {
        fixture.whenStable().then(() => {
          const cancelButton = fixture.nativeElement.querySelector('app-btn.reject');
          click(cancelButton);
          fixture.detectChanges();
          modal = fixture.nativeElement.querySelector('app-confirm');
          expect(modal).toBeNull();
        });
      });

      it('should navigate to roles list page after "confirm" is pressed', () => {
        fixture.whenStable().then(() => {
          const confirmButton = fixture.nativeElement.querySelector('app-btn.confirm');
          click(confirmButton);
          deleteRoleSpy.calls.mostRecent().returnValue.subscribe(() => {
            expect(navigateSpy).toHaveBeenCalledWith(['/roles']);
          });
        });
      });
    });

    it('should show submit button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const submitButton = fixture.nativeElement.querySelector('button.submit');
        expect(submitButton).not.toBeNull();
      });
    });

    describe ('after "submit" button is pressed ', () => {
     let submitButton;

      beforeEach(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          submitButton = fixture.nativeElement.querySelector('button.submit');
          click(submitButton);
        });
      });

      it('should navigate to user list after submit on successful response', () => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          editRoleSpy.calls.mostRecent().returnValue.subscribe(() => {
            expect(navigateSpy).toHaveBeenCalledWith(['/roles']);
          });
        });
      });

      it('should navigate to user list after submit on successful response', () => {
        editRoleSpy.and.returnValue(fakeAsyncResponse(errorResponse));
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          editRoleSpy.calls.mostRecent().returnValue.subscribe(() => {
            expect(navigateSpy).not.toHaveBeenCalled();
          });
        });
      });

    });

    it('all group permissions should be checked if permission group select button is checked', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const checkButton = fixture.nativeElement.querySelector('app-button-checkbox input');
        // select all
        click(checkButton);
        fixture.detectChanges();
        expect(checkButton.checked).toBeTruthy();
        const checkBoxes = fixture.nativeElement.querySelectorAll('app-checkbox input');
        expect(checkBoxes[0].checked).toBeTruthy();
        expect(checkBoxes[1].checked).toBeTruthy();
      });
    });

    it('all group permissions should not be checked if permission group select button is not checked', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const checkButton = fixture.nativeElement.querySelector('app-button-checkbox input');
        // select all
        click(checkButton);
        // deselect all
        click(checkButton);
        fixture.detectChanges();
        expect(checkButton.checked).toBeFalsy();
        const checkBoxes = fixture.nativeElement.querySelectorAll('app-checkbox input');
        expect(checkBoxes[0].checked).toBeFalsy();
        expect(checkBoxes[1].checked).toBeFalsy();
      });
    });

    it('permissions group select button should not be checked if not all group permissions is selected', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const checkButton = fixture.nativeElement.querySelector('app-button-checkbox input');
        expect(checkButton.checked).toBeFalsy();
      });
    });

    it('permissions group select button should be checked if all group permissions is selected', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const checkBoxes = fixture.nativeElement.querySelectorAll('app-checkbox input');
        click(checkBoxes[1]);
        fixture.detectChanges();
        const checkButton = fixture.nativeElement.querySelector('app-button-checkbox input');
        expect(checkButton.checked).toBeTruthy();
      });
    });
  });

  describe('if user create role', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ActivatedRoute, useValue: { params: of({ roleId: null }) }
          }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(RolesAddComponent);
      component = fixture.componentInstance;
      rolesService = fixture.debugElement.injector.get(RolesService);
      getRoleSpy = spyOn(rolesService, 'getRole').and.returnValue(fakeAsyncResponse(getRoleData));
      createRoleSpy = spyOn(rolesService, 'createRole').and.returnValue(fakeAsyncResponse(createRoleData));
      getPermissionsListSpy = spyOn(rolesService, 'getPermissionsList').and.returnValue(fakeAsyncResponse(getPermissionsListData));
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load permissions data on init', () => {
      fixture.whenStable().then(() => {
        expect(component.permissionsMap).toEqual(getPermissionsListData);
      });
    });

    it('should not show delete button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const deleteButton = fixture.nativeElement.querySelector('button.deactive');
        expect(deleteButton).toBeNull();
      });
    });

    it('should show submit button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const submitButton = fixture.nativeElement.querySelector('button.submit');
        expect(submitButton).not.toBeNull();
      });
    });

    testFormControlForm(() => {
      return {
        component: component,
        fixture: fixture,
        formControl: component.roleForm,
        submitButton: () => fixture.nativeElement.querySelector('button.submit'),
        fillForm: () => {
          component.roleForm.controls.name.setValue('Name');
          component.roleForm.controls.permissions.setValue(['perm_create_investment_run']);
          fixture.detectChanges();
        },
        changeToUnsuccess: () => {
          createRoleSpy.and.returnValue(fakeAsyncResponse(errorResponse));
        }
      };
    });
  });
});
