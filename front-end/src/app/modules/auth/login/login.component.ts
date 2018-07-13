declare function require(path: string);

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  username:string = '';
  password:string = '';
  status: string = '';
  touched: boolean = false;
  showPasswordReset: boolean = false;
  reset_email: string = '';
  password_reset_sent: boolean = false;
  password_reset_status: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {}

  authenticate () {
    this.authService.authenticate(this.username, this.password).subscribe(
      (data) => {
        this.redirectToPage();
        this.touched = true;
      }, error => {
        this.touched = true;
        if(error.error) {
          this.status = error.error.error;
        }
        console.log("Error happened", error);
      });
  }

  redirectToPage () {
    this.router.navigate(['dashboard']);
  }

  showPassReset () {
    console.log("SshowPasswordReset = true")
    this.showPasswordReset = true;
  }

  hidePassReset () {
    console.log("SshowPasswordReset = false")

    this.showPasswordReset = false;

    console.log(this.showPasswordReset);
  }

  requestPasswordReset() {
    this.authService.requestPasswordReset(this.reset_email).subscribe(response => {
      this.password_reset_sent = true;
    }, error => {
      if(error.error) {
        this.password_reset_status = error.error.error;
      }
    });
  }
}
