import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';
import { TokenCheck } from '../models/tokenCheck';
import { tap } from 'rxjs/operators';

class Passwords {
  new_password: string = '';
  repeat_repeat: string = '';
}

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  token: TokenCheck = new TokenCheck();
  pass: Passwords = {
    new_password: '',
    repeat_repeat: ''
  };
  status: string = '';
  done: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token.value = params.token;
      this.checkResetTokenValidity();
    });
  }

  checkResetTokenValidity () {
    this.status = '';
    this.authService.checkResetTokenValidity(this.token.value).pipe(
      tap(data => {
        this.token.validityChecked = true;
      })
    ).subscribe(data => {
      this.token.isValid = true;
    }, error => {
      this.token.isValid = false;
      if(error.error) {
        this.status = error.error.error;
      }
    });
  }

  changePassword () {
    if (!this.pass.new_password || !this.pass.new_password) {
      this.status = "Fields can't be empty";
      return false;
    }

    if (!this.passwordsMatch()) {
      this.status = "Passwords doesn't match";
      return false;
    }

    this.authService.resetPassword(this.token.value, this.pass.new_password)
    .subscribe(response => {
      this.done = true;
    }, error => {
      if(error.error) {
        this.status = error.error.error;
      }
    });
  }

  passwordsMatch () {
    return this.pass.new_password === this.pass.repeat_repeat;
  }
}
