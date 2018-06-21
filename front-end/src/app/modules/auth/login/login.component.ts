import { NgModule, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { BrowserModule } from '@angular/platform-browser';

import { AuthService } from '../../../services/auth/auth.service';

import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

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
  showPasswordReset = false;
  reset_email = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    
  }

  authenticate () {
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
      console.log(response);
    });
  }
}

@NgModule({
  declarations: [
    LoginComponent,
    BtnComponent,
    ModalComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule { }