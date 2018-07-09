import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';

import { AuthGuard } from './route-auth.guard';
import { PermissionGuard } from './route-permission.guard';

import { LoginComponent } from '../../modules/auth/login/login.component';
import { PasswordResetComponent } from '../../modules/auth/password-reset/password-reset.component';
import { DashboardComponent } from '../../modules/dashboard/dashboard.component';
import { EditInfoComponent } from '../../modules/auth/edit-info/edit-info.component';
import { RolesAddComponent } from '../../modules/roles/roles-add/roles-add.component';
import { RolesListComponent } from '../../modules/roles/roles-list/roles-list.component';
import { UsersListComponent } from '../../modules/users/users-list/users-list.component';
import { UsersInfoComponent } from '../../modules/users/users-info/users-info.component';
import { UsersAddComponent } from '../../modules/users/users-add/users-add.component';
import { AcceptInviteComponent } from '../../modules/auth/accept-invite/accept-invite.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'password_reset', component: PasswordResetComponent },
  { path: 'invitation', component: AcceptInviteComponent },
  { path: 'change_my_info', component: EditInfoComponent, canActivate: [AuthGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, /* PermissionGuard */]/* ,
    data: { requiredPermission: ['VIEW_INVESTMENT_RUN']} */ // restrict route to be accessed with certain permissions
  },
  {
    path: 'roles',
    component: RolesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'roles/add',
    component: RolesAddComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'roles/edit/:roleId',
    component: RolesAddComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: UsersListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users/info',
    component: UsersInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users/edit/:userId',
    component: UsersInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users/add',
    component: UsersAddComponent,
    canActivate: [AuthGuard]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }