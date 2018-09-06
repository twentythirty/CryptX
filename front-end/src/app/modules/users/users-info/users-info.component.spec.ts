import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import permissions from '../../../config/permissions';
import { UsersModule } from '../users.module';
import { UsersInfoComponent } from './users-info.component';
import { UsersService } from '../../../services/users/users.service';
import { RolesService } from '../../../services/roles/roles.service';


const UsersServiceStub = {
  getUser: () => {
    return fakeAsyncResponse({
      success: true,
      user: {
        id: 24,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@domain.com',
        created_timestamp: 1535546274603,
        reset_password_token_hash: null,
        reset_password_token_expiry_timestamp: null,
        is_active: true,
        roles: {
          '0': {
            id: 4,
            name: 'Ultimate role',
            user_role: {
              role_id: 4,
              user_id: 24
            }
          }
        }
      }
    });
  },

  saveUser: () => {
    return fakeAsyncResponse({});
  }
};

const RolesServiceStub = {
  getAllRoles: () => {
    return fakeAsyncResponse({
      success: true,
      roles: [
        {
          id: 4,
          name: 'Ultimate role',
          permissions: Object.values(permissions)
        }
      ],
      footer: [],
      count: 1
    });
  }
};


describe('UsersAddComponent', () => {
  let component: UsersInfoComponent;
  let fixture: ComponentFixture<UsersInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UsersModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: UsersService, useValue: UsersServiceStub },
        { provide: RolesService, useValue: RolesServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
