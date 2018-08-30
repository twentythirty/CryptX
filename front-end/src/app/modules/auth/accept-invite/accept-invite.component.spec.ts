import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { AuthModule } from '../auth.module';
import { AcceptInviteComponent } from './accept-invite.component';
import { InviteService } from './invite.service';


const InviteServiceStub = {
	checkToken: (token: string) => {
		return fakeAsyncResponse({
			success: true,
			invitation: {
        id: 45,
        was_used: false,
        token: "2394a0ed-3ede-457e-ad60-324532a1ade0",
        token_expiry_timestamp: 1525424340810,
        email: "john.doe@cryptx.io",
        first_name: "John",
        last_name: "Doh",
        role_id: 25,
        creator_id: 888
      }
		});
	},

  fulfillInvitation: () => {
    return fakeAsyncResponse({
      success: true,
      user: {
        id: 45,
        first_name: "John",
        last_name: "Doh",
        email: "john.doe@cryptx.io",
        created_timestamp: 1525424340810,
        reset_password_token_hash: "79054025255fb1a26e4bc422aef54eb4",
        reset_password_token_expiry_timestamp: 1525424340810,
        is_active: true
      }
    });
  }
};


describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AuthModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InviteService, useValue: InviteServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
