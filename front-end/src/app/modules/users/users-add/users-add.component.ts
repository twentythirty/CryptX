import { Component, OnInit } from '@angular/core';
import { RolesService } from "../../../services/roles/roles.service";
import { RolesAllRequestData } from "../../../shared/models/api/rolesAllRequestData";
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../../shared/models/user";
import { UsersService } from "../../../services/users/users.service";

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss']
})
export class UsersAddComponent implements OnInit {

  constructor(private rolesService: RolesService,
              private usersService: UsersService,
              private router: Router) { 
  }

  rolesRequestData: RolesAllRequestData = {
    limit: 20,
    offset: 0
  };

  rolelist = [];
  firstName = " " ;
  lastName = " ";
  email: " ";

  invite = {
    first_name: "String",
    last_name: "String",
    email: "String",
    role_id: []
  }

  loading = false;

  ngOnInit() {
    this.getAllRoles();
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
        this.rolelist.push(obj);
      });
    });
  }

  saveUser(){
    this.invite.first_name = this.firstName;
    this.invite.last_name = this.lastName;
    this.invite.email = this.email;
    console.log(JSON.stringify(this.invite));
    this.usersService.sendInvite(this.invite).subscribe(
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
   let arr = [];
   this.rolelist.forEach(role => {
      if (role.is_active) {
        arr.push(role.id);
      }
    });
   this.invite.role_id = arr;
  }

}
