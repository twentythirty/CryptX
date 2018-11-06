declare function require(path: string);

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { tap, finalize } from 'rxjs/operators';

import { AuthService } from '../../../services/auth/auth.service';
import { TokenCheck } from '../models/tokenCheck';

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
  imageLogo = require('Images/Logo.png');

  token: TokenCheck = new TokenCheck();
  status: string = '';
  loading: boolean = false;

  resetForm = new FormGroup ({
    new_password: new FormControl('', [Validators.required]),
    password_confirm: new FormControl('', [Validators.required]),
  });

  constructor(
    public router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token.value = params.token;
      this.checkResetTokenValidity();
    });
  }

  checkResetTokenValidity() {
    this.status = '';
    this.authService.checkResetTokenValidity(this.token.value).pipe(
      tap(data => {
        this.token.validityChecked = true;
      })
    ).subscribe(data => {
      this.token.isValid = true;
    }, error => {
      this.token.isValid = false;
      if (error.error) {
        this.status = error.error.error;
      }
    });
  }

  changePassword() {
    if (!this.passwordsMatch()) {
      this.status = 'Passwords doesn\'t match';
      return false;
    }

    this.loading = true;

    this.authService.resetPassword(this.token.value, this.resetForm.controls.new_password.value).pipe(
      finalize(() => this.loading = false)
    )
    .subscribe(
      res => {
        this.authService.setAuthData(res);
        this.router.navigate(['/dashboard']);
      },
      error => {
        if (error.error) {
          this.status = error.error.error;
        }
      }
    );
  }

  passwordsMatch() {
    return this.resetForm.controls.new_password.value === this.resetForm.controls.password_confirm.value;
  }
}
