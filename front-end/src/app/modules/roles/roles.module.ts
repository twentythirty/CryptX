import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';

import { RolesService } from '../../services/roles/roles.service';

import { RolesListComponent } from './roles-list/roles-list.component';
import { RolesAddComponent } from './roles-add/roles-add.component';

@NgModule({
  declarations: [
    RolesListComponent,
    RolesAddComponent,
    RolesAddComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    RouterModule,
    SharedModule,
  ],
  providers: [
    RolesService
  ]
})
export class RolesModule { }