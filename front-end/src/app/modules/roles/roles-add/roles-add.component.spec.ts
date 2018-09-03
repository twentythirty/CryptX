import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { RolesAddComponent } from './roles-add.component';
import { RolesModule } from '../roles.module';
import { RolesService } from '../../../services/roles/roles.service';


const RolesServiceStub = {
  getPermissionsList: () => {
    return fakeAsyncResponse({});
  },

  getRole: () => {
    return fakeAsyncResponse({});
  },

  deleteRole: () => {
    return fakeAsyncResponse({});
  },

  createRole: () => {
    return fakeAsyncResponse({});
  },

  editRole: () => {
    return fakeAsyncResponse({});
  }
};


describe('RolesAddComponent', () => {
  let component: RolesAddComponent;
  let fixture: ComponentFixture<RolesAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RolesModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: RolesService, useValue: RolesServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
