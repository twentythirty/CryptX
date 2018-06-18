import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username:string = '';
  password:string = '';
  status = '';
  touched = false;

  constructor(private authService: AuthService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    
  }

  authenticate () {
    console.log("Start authenticating with ", this.username, this.password);
    this.authService.authenticate(this.username, this.password).subscribe(
      (data) => {
        this.redirectToPage();
        this.touched = true;
      }, error => {
        this.touched = true;
        this.status = error.error.error;
        console.log("Error happened", error);
      });
  }

  redirectToPage () {
    this.router.navigate(['dashboard']);
  }

  forgotPassword () {
    console.log("Trigger password reset");
  }
}
