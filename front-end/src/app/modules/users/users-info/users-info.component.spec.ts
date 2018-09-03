import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { UsersModule } from '../users.module';
import { UsersInfoComponent } from './users-info.component';
import { UsersService } from '../../../services/users/users.service';
import { RolesService } from '../../../services/roles/roles.service';


const UsersServiceStub = {
  getUser: () => {
    return fakeAsyncResponse({});
  },

  saveUser: () => {
    return fakeAsyncResponse({});
  }
};

const RolesServiceStub = {
  getAllRoles: () => {
    return fakeAsyncResponse({});
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
