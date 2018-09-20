declare function require(path: string);

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AuthService, UserLoginRequest } from '../../../services/auth/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  imageLogo = require('Images/Logo.png');

  status: string = '';
  showPasswordReset: boolean = false;
  password_reset_sent: boolean = false;
  password_reset_status: string = '';

  loading = false;
  loading2 = false;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  resetForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email]),
  });

  constructor(
    public authService: AuthService,
    public router: Router,
  ) {}

  ngOnInit() { }

  authenticate() {
    this.loading = true;

    this.authService.authenticate(<UserLoginRequest>this.loginForm.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      res => {
        this.redirectToDashboard();
      },
      error => {
        if (error.error) {
          this.status = error.error.error;
        }
        console.log('Error happened', error);
      }
    );
  }

  redirectToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  showPassReset() {
    this.showPasswordReset = true;
  }

  hidePassReset() {
    this.showPasswordReset = false;
    this.password_reset_sent = false;
    this.resetForm.reset();
  }

  requestPasswordReset() {
    this.loading2 = true;

    this.authService.requestPasswordReset(this.resetForm.controls.email.value).pipe(
      finalize(() => this.loading2 = false)
    ).subscribe(
      res => {
        this.password_reset_sent = true;
      },
      error => {
        if (error.error) {
          this.password_reset_status = error.error.error;
        }
      }
    );
  }
}
