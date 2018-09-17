import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { AuthModule } from '../auth.module';
import { EditInfoComponent } from './edit-info.component';
import { AuthService } from '../../../services/auth/auth.service';


const AuthServiceStub = {
  checkAuth: () => {
    return fakeAsyncResponse({
      '0': {
        success: true,
        permissions: [],
        model_constants: {},
        user: {
          id: 1,
          first_name: 'Admin',
          last_name: '',
          email: 'cryptx-admin@cryptx.io',
          created_timestamp: 1526975256757,
          reset_password_token_hash: null,
          reset_password_token_expiry_timestamp: null,
          is_active: true,
          roles: {
            '0': {
              id: 4,
              name: 'Ultimate role',
              user_role: {
                role_id: 4,
                user_id: 1
              },
            }
          }
        }
      }
    });
  }
};


describe('EditInfoComponent', () => {
  let component: EditInfoComponent;
  let fixture: ComponentFixture<EditInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AuthModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: AuthService, useValue: AuthServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
