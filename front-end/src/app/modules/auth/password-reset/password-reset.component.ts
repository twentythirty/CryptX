import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';

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
  token: string;
  pass: Passwords = {
    new_password: '',
    repeat_repeat: ''
  };
  status: string = '';
  tokenIsValid: boolean = true;
  done: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params.token;
      this.checkResetTokenValidity();
    });
  }

  checkResetTokenValidity () {
    this.status = '';
    this.authService.checkResetTokenValidity(this.token).subscribe(data => {
      this.tokenIsValid = true;
    }, error => {
      this.tokenIsValid = false;
      this.status = error.error.error;
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

    this.authService.resetPassword(this.token, this.pass.new_password)
    .subscribe(response => {
      this.done = true;
      console.log("Success", response);
    }, error => {
      this.status = error.error.error;
    });
  }

  passwordsMatch () {
    return this.pass.new_password === this.pass.repeat_repeat;
  }
}
