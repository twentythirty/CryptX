import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';


import { LoginComponent } from '../../modules/auth/login/login.component';
import { PasswordResetComponent } from '../../modules/auth/password-reset/password-reset.component';
import { DashboardComponent } from '../../modules/dashboard/dashboard.component';
import { EditInfoComponent } from '../../modules/auth/edit-info/edit-info.component';
import { AuthGuard } from './route-auth.guard';
import { PermissionGuard } from './route-permission.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'password_reset', component: PasswordResetComponent },
  { path: 'change_my_info', component: EditInfoComponent, canActivate: [AuthGuard] },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard, /* PermissionGuard */]/* ,
    data: { requiredPermission: ['VIEW_INVESTMENT_RUN']} */ // restrict route to be accessed with certain permissions
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }