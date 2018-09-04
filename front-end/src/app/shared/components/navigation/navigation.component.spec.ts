import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationComponent } from './navigation.component';
import { extraTestingModules } from '../../../utils/testing';
import { AuthService } from '../../../services/auth/auth.service';


const AuthServiceStub = {
  user: {
    id: 1,
    first_name: 'Admin',
    last_name: '',
    email: 'admin@cryptx.io',
    created_timestamp: 1526975256757,
    reset_password_token_hash: null,
    reset_password_token_expiry_timestamp: null,
    is_active: true
  },

  hasPermissions: () => {
    return true;
  }
};


describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationComponent ],
      imports: [
        ...extraTestingModules
      ],
      providers: [
        { provide: AuthService, useValue: AuthServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
