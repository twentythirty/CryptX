import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';

import { AuthGuard } from './route-auth.guard';
import { PermissionGuard } from './route-permission.guard';
import { PendingChangesGuard } from './route-pending-changes.guard'

import { LoginComponent } from '../../modules/auth/login/login.component';
import { PasswordResetComponent } from '../../modules/auth/password-reset/password-reset.component';
import { DashboardComponent } from '../../modules/dashboard/dashboard/dashboard.component';
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
import { OrderGroupComponent } from '../../modules/investment/order-group/order-group.component';
import { ExecutionOrderDetailComponent } from '../../modules/investment/execution-order-detail/execution-order-detail.component';
import { ExecutionOrderFillDetailComponent } from '../../modules/investment/execution-order-fill-detail/execution-order-fill-detail.component';
import { DepositDetailComponent } from '../../modules/investment/deposit-detail/deposit-detail.component';
import { InstrumentAddComponent } from '../../modules/instruments/instrument-add/instrument-add.component';
import { InstrumentListComponent } from '../../modules/instruments/instrument-list/instrument-list.component';
import { InstrumentInfoComponent } from '../../modules/instruments/instrument-info/instrument-info.component';
import { LiquidityListComponent } from '../../modules/liquidity/liquidity-list/liquidity-list.component';
import { LiquidityCreateComponent } from '../../modules/liquidity/liquidity-create/liquidity-create.component';
import { LiquidityInfoComponent } from '../../modules/liquidity/liquidity-info/liquidity-info.component';
import { DepositListComponent } from "../../modules/deposit/deposit-list/deposit-list.component";
import { DepositInfoComponent } from "../../modules/deposit/deposit-info/deposit-info.component";
import { OrdersListComponent } from '../../modules/orders/orders-list/orders-list.component';
import { ExecutionOrdersComponent } from "../../modules/investment/execution-orders/execution-orders.component";
import { RecipeRunListComponent } from "../../modules/recipe-run/recipe-run-list/recipe-run-list.component";
import { ExecutionOrderListComponent } from "../../modules/execution-orders/execution-order-list/execution-order-list.component";
import { TransfersListComponent } from "../../modules/cold-storage-transfers/transfers-list/transfers-list.component";
import { AddAccountComponent } from "../../modules/cold-storage-accounts/add-account/add-account.component";
import { AccountsListComponent } from "../../modules/cold-storage-accounts/accounts-list/accounts-list.component";
import { CustodiansListComponent } from '../../modules/cold-storage-custodians/custodians-list/custodians-list.component';
import { ColdStorageAccountStorageFeeListComponent } from '../../modules/cold-storage-account-storage-fee/cold-storage-account-storage-fee-list/cold-storage-account-storage-fee-list.component';

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
    path: 'recipe_runs',
    component: RecipeRunListComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'run',
    children: [
      { path: 'investment/:id', component: InvestmentRunDetailComponent },
      { path: 'recipe/:id', component: RecipeRunDetailComponent },
      { path: 'deposit/:id', component: DepositDetailComponent },
      { path: 'order/:id', component: OrderDetailComponent },
      { path: 'order-group/:id', component: OrderGroupComponent },
      { path: 'execution-order/:id', component: ExecutionOrderDetailComponent },
      { path: 'execution-order-fill/:id', component: ExecutionOrderFillDetailComponent },
      { path: 'execution-orders/:id', component: ExecutionOrdersComponent},
    ],
    canActivate: [AuthGuard, PermissionGuard],
    data: { requiredPermission: ['VIEW_INVESTMENT_RUN']}
  },

  {
    path: 'instruments',
    component: InstrumentListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'instruments/create',
    component: InstrumentAddComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'instrument/:id',
    component: InstrumentInfoComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PendingChangesGuard]
  },

  {
    path: 'liquidity_requirements',
    component: LiquidityListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'liquidity_requirements/create',
    component: LiquidityCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'liquidity_requirements/preview/:id',
    component: LiquidityInfoComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'deposits',
    component: DepositListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'deposits/view/:depositId',
    component: DepositInfoComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'orders',
    component: OrdersListComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'execution_orders',
    component: ExecutionOrderListComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'cold_storage/transfers',
    component: TransfersListComponent,
    canActivate: [AuthGuard],
  },
  
  {
    path: 'cold_storage/accounts',
    component: AccountsListComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'cold_storage/accounts/add',
    component: AddAccountComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'cold_storage/custodians',
    component: CustodiansListComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'cold_storage/account_storage_fee',
    component: ColdStorageAccountStorageFeeListComponent,
    canActivate: [AuthGuard]
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
