import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InviteService } from './invite.service';
import { tap } from 'rxjs/operators';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { TokenCheck } from '../models/tokenCheck';

class UserFulfillInvitationInfo {
  new_password: string
  repeat_password: string
}
class QueryParamsToken {
  token: string
}
class InvitationInfo {
  id: number
  was_used: boolean
  token: string
  token_expiry_timestamp: Date
  email: string
  first_name: string
  last_name: string
  role_id: number
  creator_id: number
}

class InvitationCheckSuccessResponse {
  success: true
  invitation: InvitationInfo
}

@Component({
  selector: 'app-accept-invite',
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.scss']
})
export class AcceptInviteComponent implements OnInit {
  token: TokenCheck = new TokenCheck();
  done: boolean = false;
  message: string;
  invitationInfo: InvitationInfo;
  userInfo: UserFulfillInvitationInfo = {
    new_password: '',
    repeat_password: ''
  };
  userInfoForm: FormGroup;

  constructor(private route: ActivatedRoute, private inviteService: InviteService) { }

  ngOnInit() {
    this.userInfoForm = new FormGroup({
      password: new FormControl('', [
        Validators.required
      ]),
      password_repeat: new FormControl('', [
        Validators.required
      ])
    });

    this.route.queryParams.subscribe((params: QueryParamsToken) => {
      this.token.value = params.token;
      this.checkTokenValidity();
    });
  }

  checkTokenValidity () {
    this.inviteService.checkToken(this.token.value).pipe(
      tap (() => {
        this.token.validityChecked = true;
      })
    ).subscribe((data: InvitationCheckSuccessResponse) => {
      console.log(data);
      this.invitationInfo = data.invitation;
      this.token.isValid = true;
    }, error => {
      this.token.isValid = false;
      this.message = error.error.error;
      console.log(error);
    });
  }


  fulfillInvitation  () {
    if(this.userInfoForm.invalid) {
      this.message = "Password is required";
      return ;
    }

    if(this.userInfoForm.value.password != this.userInfoForm.value.password_repeat) {
      this.message = "Passwords doesn't match";
      return ;
    }
    
    let data = {
      "invitation_id": this.invitationInfo.id,
      "password": this.userInfoForm.value.password
    }

    this.inviteService.fulfillInvitation(data).subscribe(data => {
      this.done = true;
    }, error => {
      this.message = error.error.error;
    });
  }
}
