import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { UsersService } from '../../../services/users/users.service';
import { NgForm } from '@angular/forms'

import { User } from '../../../shared/models/user';
import { RolesPermissionsResultData } from '../../../shared/models/api/rolesPermissionsResultData';
import { RolesService } from "../../../services/roles/roles.service";
import { RolesAllRequestData } from "../../../shared/models/api/rolesAllRequestData";


@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
  styleUrls: ['./users-info.component.scss']
})
export class UsersInfoComponent implements OnInit {
 
  userId: number;
  user: User;
  userRoles= [];
  rolelist = [];
  rolesRequestData: RolesAllRequestData;
  loading = false;
  showDeactivateConfirm = false;
  buttonName: String;
  list = [];

  constructor(private router: Router, 
              private route:ActivatedRoute, 
              private usersService: UsersService,
              private rolesService: RolesService) {  
    this.route.params
      .filter(params => params.userId)
      .subscribe( params => {
        this.userId = params.userId;
      }); }

  ngOnInit() {
      this.usersService.getUser(this.userId).subscribe(data => {
          this.user = data.user;
          if (this.user.is_active){
            this.buttonName='Deactivate'
          }else {
            this.buttonName ='Activate'
          }
          this.userRoles = Object.values(data.user.roles);
          this.getAllRoles();
        });
  }

  getAllRoles() {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      res.roles.forEach(role => {
        let obj = {
          id: Number,
          name: String,
          is_active: false
        };
        obj.id = role.id;
        obj.name = role.name;
        this.userRoles.forEach(userrole => {
          if (obj.id === userrole.id){
            obj.is_active = true;
          }
        })
        this.rolelist.push(obj);
      });
    });
  }

  closeDeactivateConfirm(){
    this.showDeactivateConfirm = false;
  }

  saveUser(){
    this.usersService.saveUser(this.user).subscribe(
      data => {
        this.router.navigate(['/users']);
      }, error => {
        console.log('Error', error);
      }, () => {
        this.loading = false;
      });
    this.usersService.updateUserRoles(this.user.id,this.list).subscribe(
      data => {
        this.router.navigate(['/users']);
      }, error => {
        console.log('Error', error);
      }, () => {
        this.loading = false;
      }); 
  }

  deactivateUser(){
    this.user.is_active = !this.user.is_active;
    this.usersService.saveUser(this.user).subscribe(
      data => {
        this.router.navigate(['/users']);
      }, error => {
        console.log('Error', error);
      }, () => {
        this.loading = false;
      });
  }

  addRole(role){
    role.is_active = !role.is_active;
    this.list = [];
    this.rolelist.forEach(role => {
      if (role.is_active){
        this.list.push(role.id);
      }
    });
  }

}
