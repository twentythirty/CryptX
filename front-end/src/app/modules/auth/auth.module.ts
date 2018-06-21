import { NgModule, Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { BrowserModule } from '@angular/platform-browser';

import { AuthService } from '../../services/auth/auth.service';

import { LoginComponent } from './login/login.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { EditInfoComponent } from './edit-info/edit-info.component';

@NgModule({
  declarations: [
    LoginComponent,
    BtnComponent,
    ModalComponent,
    PasswordResetComponent,
    EditInfoComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    RouterModule
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule { }