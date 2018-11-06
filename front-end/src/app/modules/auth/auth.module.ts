import { NgModule, Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { BrowserModule } from '@angular/platform-browser';

import { AuthService } from '../../services/auth/auth.service';

import { LoginComponent } from './login/login.component';
import { SharedModule } from '../../shared/shared.module';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { EditInfoComponent } from './edit-info/edit-info.component';
import { AcceptInviteComponent } from './accept-invite/accept-invite.component';
import { InviteService } from './accept-invite/invite.service';
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';
import { MatSnackBarModule } from '@angular/material';

@NgModule({
  declarations: [
    AcceptInviteComponent,
    LoginComponent,
    PasswordResetComponent,
    EditInfoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
  ],
  providers: [
    AuthService,
    InviteService,
    ModelConstantsService,
  ]
})
export class AuthModule { }