import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { filter, finalize } from 'rxjs/operators';
import { zip } from 'rxjs/observable/zip';

import { User } from '../../../shared/models/user';
import { RolesAllRequestData } from '../../../shared/models/api/rolesAllRequestData';
import { UsersService } from '../../../services/users/users.service';
import { RolesService } from '../../../services/roles/roles.service';


@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
  styleUrls: ['./users-info.component.scss']
})
export class UsersInfoComponent implements OnInit {

  userForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    roleId: new FormControl([], Validators.required),
  });

  userId: number;
  userName: String;
  user: User;
  userRoles = [];
  rolelist = [];
  rolesRequestData: RolesAllRequestData;
  loading = false;
  showDeactivateConfirm = false;
  buttonName: String;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {
    this.route.params.pipe(
      filter(params => params.userId)
    ).subscribe(params => {
      this.userId = params.userId;
    });
  }

  ngOnInit() {
    zip(
      this.rolesService.getAllRoles(this.rolesRequestData),
      this.usersService.getUser(this.userId),
    ).subscribe((res) => {
      const [{ roles }, { user }] = res;

      this.userRoles = Object.values(user.roles);
      this.user = user;
      this.userForm.controls.firstName.setValue(this.user.first_name);
      this.userForm.controls.lastName.setValue(this.user.last_name);
      this.userForm.controls.email.setValue(this.user.email);

      this.userName = String(this.user.first_name + ' ' + this.user.last_name);
      this.buttonName = this.setButtonName();

      this.checkSelectedRoles(roles);
    });
  }

  checkSelectedRoles(roles) {
    roles.forEach(role => {
      const obj = {
        id: role.id,
        name: role.name,
        isActive: false
      };
      this.userRoles.forEach(userrole => {
        if (obj.id === userrole.id) {
          obj.isActive = true;
          this.userForm.controls.roleId.value.push(userrole.id);
          this.userForm.controls.roleId.updateValueAndValidity();
        }
      });
      this.rolelist.push(obj);
    });
  }

  setButtonName() {
    if (this.user.is_active === true) {
      return 'Deactivate';
    } else if (this.user.is_active === false) {
      return 'Activate';
    }
  }

  saveUser() {
    if (this.userForm.invalid || this.userForm.value.roleId.length === 0) {
      return;
    }
    this.loading = true;
    this.user.roles = this.userForm.controls.roleId.value;
    this.usersService.saveUser(this.user).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/users']);
        } else {
          this.showDeactivateConfirm = false;
        }
      }, error => {
          console.log(error);
        }
    );
  }

  deactivateUser() {
    this.user.is_active = !this.user.is_active;
    this.saveUser();
  }

  showModal() {
    if (this.userForm.invalid || this.userForm.value.roleId.length === 0) {
      return;
    }
    this.showDeactivateConfirm = true;
  }

  closeDeactivateConfirm() {
    this.showDeactivateConfirm = false;
  }

  addRole(role) {
    this.userForm.controls.roleId.markAsTouched();
    role.isActive = !role.isActive;
    const roleId = [];
    this.rolelist.forEach( element => {
      if (element.isActive) {
        roleId.push(element.id);
      }
    });
    this.userForm.controls.roleId.setValue(roleId);
  }

}
