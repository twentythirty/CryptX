import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { UsersListComponent } from './users-list.component';
import { UsersModule } from '../users.module';
import { UsersService } from '../../../services/users/users.service';
import { getAllUsersData } from '../../../testing/service-mock/users.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let usersService: UsersService;
  let location: Location;
  let router: Router;
  let getUsersDataSpy;
  let navigateSpy;
  let headerLovColumns: Array<string>;
  let button: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UsersModule,
        ...extraTestingModules
      ],
      providers: [
        UsersService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    usersService = fixture.debugElement.injector.get(UsersService);
    getUsersDataSpy = spyOn(usersService, 'getAllUsers').and.returnValue(fakeAsyncResponse(getAllUsersData));
    navigateSpy = spyOn(component.router, 'navigate');
    headerLovColumns = ['last_name', 'first_name', 'email', 'is_active'];
    location = TestBed.get(Location);
    router = TestBed.get(Router);
    button = fixture.nativeElement.querySelector('div a');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load users table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.usersDataSource.body).toEqual(getAllUsersData.users);
      expect(component.usersDataSource.footer).toEqual(getAllUsersData.footer);
      expect(component.count).toEqual(getAllUsersData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    fixture.whenStable().then(() => testHeaderLov(component.usersDataSource, headerLovColumns));
  });

  it('should be navigated to user page on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/users/edit', getAllUsersData.users[0].id]);
    });
  });

  it('should be navigated to user creation page on "add new user" button press', fakeAsync(() => {
    click(button);
    tick();
    expect(location.path()).toBe('/users/add');
  }));
});
