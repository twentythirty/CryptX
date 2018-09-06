import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { UsersListComponent } from './users-list.component';
import { UsersModule } from '../users.module';
import { UsersService } from '../../../services/users/users.service';


const UsersServiceStub = {
  getAllUsers: () => {
    return fakeAsyncResponse({});
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse({});
  }
};


describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UsersModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: UsersService, useValue: UsersServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
