declare function require(path: string);

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../services/auth/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  imageLogo = require('Images/Logo.png');

  username: string = '';
  password: string = '';
  status: string = '';
  touched: boolean = false;
  showPasswordReset: boolean = false;
  reset_email: string = '';
  password_reset_sent: boolean = false;
  password_reset_status: string = '';

  loading = false;
  loading2 = false;

  validation;
  loginValidation;
  resetValidation;

  loginForm = new FormGroup({
    Firstname: new FormControl('', [Validators.required]),
    Lastname: new FormControl('', [Validators.required]),
  });

  resetForm: FormGroup = new FormGroup({
    Email: new FormControl('', [Validators.email]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() { }

  authenticate() {
    if(this.loginForm.valid) {
      this.loading = true;

      this.authService.authenticate(this.username, this.password).pipe(
        finalize(() => this.loading = false)
      ).subscribe(
        data => {
          this.redirectToDashboard();
          this.touched = true;
        },
        error => {
          this.touched = true;
          if (error.error) {
            this.status = error.error.error;
          }
          console.log("Error happened", error);
      });
    } else {
      this.markAsTouched(this.loginForm);
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

  redirectToDashboard() {
    this.router.navigate(['dashboard']);
  }

  showPassReset() {
    this.showPasswordReset = true;
  }

  hidePassReset() {
    this.showPasswordReset = false;
    this.password_reset_sent = false;
    this.reset_email = '';
    this.resetForm.reset();
  }

  requestPasswordReset() {
    if(this.resetForm.valid) {
      this.password_reset_sent = true;
      this.loading2 = true;

      this.authService.requestPasswordReset(this.reset_email).pipe(
        finalize(() => this.loading2 = false)
      ).subscribe(
        res => {},
        error => {
          if (error.error) {
            this.password_reset_status = error.error.error;
          }
        }
      );
    } else {
      this.markAsTouched(this.resetForm);
    }
  }
}
