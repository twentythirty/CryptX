import { NgModule, Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { RolesService } from '../../services/roles/roles.service';

@Component({
  selector: 'app-roles-add',
  templateUrl: './roles-add.component.html',
  styleUrls: ['./roles-add.component.scss']
})
export class RolesAddComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    RolesAddComponent
  ],
  imports: [
    BrowserModule,
    RouterModule
  ],
  providers: [
    
  ]
})
export class RolesAddModule { }