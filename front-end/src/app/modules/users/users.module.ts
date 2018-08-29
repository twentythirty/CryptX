import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { UsersService } from '../../services/users/users.service';


import { UsersListComponent } from './users-list/users-list.component';
import { UsersInfoComponent } from './users-info/users-info.component';
import { UsersAddComponent } from './users-add/users-add.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    BrowserModule,
    RouterModule,
    ReactiveFormsModule, FormsModule
  ],
  declarations: [UsersListComponent, UsersInfoComponent, UsersAddComponent],
    providers: [
    UsersService
  ]
})
export class UsersModule { }
