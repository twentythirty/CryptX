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

import { AssetListComponent } from '../../modules/asset/asset-list/asset-list.component';
import { AssetViewComponent } from '../../modules/asset/asset-view/asset-view.component';
import { InvestmentRunDetailComponent } from '../../modules/investment/investment-run-detail/investment-run-detail.component';
import { RecipeRunDetailComponent } from '../../modules/investment/recipe-run-detail/recipe-run-detail.component';
import { OrderDetailComponent } from '../../modules/investment/order-detail/order-detail.component';

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

  {
    path: 'assets',
    component: AssetListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermission: ['VIEW_ASSETS']}
  },
  {
    path: 'assets/view/:assetId',
    component: AssetViewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermission: ['VIEW_ASSETS']}
  },

  {
    path: 'run',
    children: [
      { path: 'investment/:id', component: InvestmentRunDetailComponent },
      { path: 'recipe/:id', component: RecipeRunDetailComponent },
      // { path: 'deposit/:id', component: DepositDetailComponent },
      { path: 'order/:id', component: OrderDetailComponent },
      // { path: 'execution-order/:id', component: ExecutionOrderDetailComponent }
    ],
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermission: ['VIEW_INVESTMENT_RUN']}
  },

  /**
   * Lazy loaded modules
   */
  // {
  //   path: 'assets',
  //   loadChildren: '../../modules/asset/asset.module#AssetModule',
  //   canActivate: [AuthGuard /* PermissionGuard */]/* ,
  //   data: { requiredPermission: ['VIEW_ASSETS']} */ // restrict route to be accessed with certain permissions
  // },

  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: '**', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
