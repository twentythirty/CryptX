import { NgModule, Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { BrowserModule } from '@angular/platform-browser';

import { AuthService } from '../../services/auth/auth.service';

import { LoginComponent } from './login/login.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { EditInfoComponent } from './edit-info/edit-info.component';
import { AcceptInviteComponent } from './accept-invite/accept-invite.component';
import { InviteService } from './accept-invite/invite.service';

@NgModule({
  declarations: [
    LoginComponent,
    BtnComponent,
    ModalComponent,
    PasswordResetComponent,
    EditInfoComponent,
    AcceptInviteComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserModule,
    RouterModule
  ],
  providers: [
    AuthService,
    InviteService
  ]
})
export class AuthModule { }