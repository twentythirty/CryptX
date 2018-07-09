import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetListComponent } from './asset-list/asset-list.component';

const routes: Routes = [
  { path: '', component: AssetListComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetRoutingModule { }
