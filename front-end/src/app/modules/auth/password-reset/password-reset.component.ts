declare function require(path: string);

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators/tap';

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
  pass: Passwords = {
    new_password: '',
    repeat_repeat: ''
  };
  status: string = '';

  resetForm = new FormGroup ({
    New: new FormControl('', [Validators.required]),
    Repeat: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
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
      if(error.error) {
        this.status = error.error.error;
      }
    });
  }

  changePassword() {
    if (this.resetForm.valid){
      if (!this.passwordsMatch()) {
        this.status = 'Passwords doesn\'t match';
        return false;
      }

      this.authService.resetPassword(this.token.value, this.pass.new_password).subscribe(
        res => {
          this.authService.setAuthData(res);
          this.router.navigate(['dashboard']);
        },
        error => {
          if(error.error) {
            this.status = error.error.error;
          }
        }
      );
    } else {
      this.markAsTouched(this.resetForm);
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map(field => {
      const control = group.get(field);

      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

  passwordsMatch() {
    return this.pass.new_password === this.pass.repeat_repeat;
  }
}
