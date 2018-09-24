import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router} from '@angular/router';

import { RolesService } from '../../../services/roles/roles.service';
import { RolesAllRequestData } from '../../../shared/models/api/rolesAllRequestData';
import { UsersService } from '../../../services/users/users.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss']
})
export class UsersAddComponent implements OnInit {

  constructor(
    private rolesService: RolesService,
    private usersService: UsersService,
    private router: Router
  ) {}

  rolesRequestData: RolesAllRequestData = {
    limit: 20,
    offset: 0
  };

  rolelist = [];
  loading = false;

  userForm: FormGroup = new FormGroup ({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    role_id: new FormControl([], Validators.required)
  });

  ngOnInit() {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      res.roles.forEach(role => {
        const obj = {
          id: role.id,
          name: role.name,
          is_active: false
        };
        this.rolelist.push(obj);
      });
    });
  }

  saveUser() {
    if (this.userForm.valid) {
    this.loading = true;

    this.usersService.sendInvite(this.userForm.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/users']);
        } else {
          console.log(data.message);
        }
      }
    );
    }
  }

  addRole(role) {
    role.is_active = !role.is_active;
    const role_id = [];
    this.rolelist.forEach( element => {
      if (element.is_active) {
        role_id.push(element.id);
      }
    });
    this.userForm.controls.role_id.setValue(role_id);
  }
}
