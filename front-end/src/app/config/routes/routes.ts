import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';


import { LoginComponent } from '../../modules/login/login.component';
import { DashboardComponent } from '../../modules/dashboard/dashboard.component';
import { AuthGuard } from './route-auth.guard';
import { PermissionGuard } from './route-permission.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermission: 'VIEW_INVESTMENT_RUN'}
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