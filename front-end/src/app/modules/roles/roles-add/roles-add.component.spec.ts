import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { RolesAddComponent } from './roles-add.component';
import { RolesModule } from '../roles.module';
import { RolesService } from '../../../services/roles/roles.service';


const RolesServiceStub = {
  getPermissionsList: () => {
    return fakeAsyncResponse({
      success: true,
      data: [
        {
          id: 1,
          name: 'Investment run',
          permissions: [
            {
              id: 11,
              code: 'perm_create_investment_run',
              name: 'Permission to create investment runs'
            },
            {
              id: 10,
              code: 'perm_view_investment_run',
              name: 'Permission to view investment runs'
            }
          ]
        }
      ],
      total: 1
    });
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
