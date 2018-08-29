import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';


import { RecipeRunListComponent } from './recipe-run-list/recipe-run-list.component';

import { RecipeRunsService } from "../../services/recipe-runs/recipe-runs.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    SharedModule
  ],
  declarations: [
    RecipeRunListComponent
  ],
  providers: [
    RecipeRunsService,
  ]
})
export class RecipeRunModule { }