declare function require(path: string);

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

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

  loginForm2: FormGroup = new FormGroup({
    Email: new FormControl('', [Validators.email]),
  });

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() { }

  authenticate() {
    if(this.loginForm.valid){
    this.authService.authenticate(this.username, this.password).subscribe(
      (data) => {
        this.redirectToPage();
        this.touched = true;
      }, error => {
        this.touched = true;
        if (error.error) {
          this.status = error.error.error;
        }
        console.log("Error happened", error);
      });
    if (this.loginForm.status === "INVALID") {
      this.loading = true;
    } else {
      this.redirectToPage();
      this.loading = false;
    }
    }else {
          this.markAsTouched(this.loginForm);
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map((field) => {
      const control = group.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

  redirectToPage() {
    this.router.navigate(['dashboard']);
  }

  showPassReset() {
    console.log("SshowPasswordReset = true")
    this.showPasswordReset = true;
  }

  hidePassReset() {
    console.log("SshowPasswordReset = false")

    this.showPasswordReset = false;
    this.password_reset_sent = false;
    this.reset_email = '';
    this.loginForm2.reset();
    console.log(this.showPasswordReset);
  }

  requestPasswordReset() {
    if(this.loginForm2.valid){
    this.password_reset_sent = true;
    this.authService.requestPasswordReset(this.reset_email).subscribe(response => {
    }, error => {
      if (error.error) {
        this.password_reset_status = error.error.error;
      }
    });
    if (this.loginForm2.status === "INVALID") {
      this.loading2 = true;
    } else {
      this.loading2 = false;
    }
    }else {
      this.markAsTouched(this.loginForm2);
    }
  }
}
