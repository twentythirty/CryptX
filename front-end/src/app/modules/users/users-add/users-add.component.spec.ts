import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { UsersModule } from '../users.module';
import { UsersAddComponent } from './users-add.component';
import { RolesService } from '../../../services/roles/roles.service';
import { UsersService } from '../../../services/users/users.service';
import permissions from '../../../config/permissions';


const RolesServiceStub = {
  getAllRoles: () => {
    return fakeAsyncResponse({
      success: true,
      roles: [
        {
          id: 1,
          name: 'Ultimate role',
          permissions: Object.values(permissions)
        }
      ],
      footer: [],
      count: 1
    });
  }
};

const UsersServiceStub = {
  sendInvite: () => {
    return fakeAsyncResponse({});
  }
};


describe('UsersAddComponent', () => {
  let component: UsersAddComponent;
  let fixture: ComponentFixture<UsersAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UsersModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: RolesService, useValue: RolesServiceStub },
        { provide: UsersService, useValue: UsersServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
