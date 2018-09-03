import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RolesService } from '../../../services/roles/roles.service';
import { RolesAllRequestData } from '../../../shared/models/api/rolesAllRequestData';
import { UsersService } from '../../../services/users/users.service';

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss']
})
export class UsersAddComponent implements OnInit {

  constructor(
    private rolesService: RolesService,
    private usersService: UsersService,
    private router: Router,
  ) {}

  rolesRequestData: RolesAllRequestData = {
    limit: 20,
    offset: 0
  };

  rolelist = [];
  UserName = '' ;
  UserSurname = '';
  UserEmail: '';

  invite = {
    first_name: 'String',
    last_name: 'String',
    email: 'String',
    role_id: []
  };

  loading = false;
  show = false;

  form: FormGroup;

  userForm: FormGroup = new FormGroup ({
    Name: new FormControl('', Validators.required),
    Surname: new FormControl('', Validators.required),
    Email: new FormControl('', Validators.email),
  });

  ngOnInit() {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      this.rolelist = res.roles;
      this.add();
    });
  }

  saveUser() {
    if (this.form.valid && this.userForm.valid) {
      this.invite.first_name = this.UserName;
      this.invite.last_name = this.UserSurname;
      this.invite.email = this.UserEmail;
      this.invite.role_id = this.form.controls.selectedItems.value;

      this.usersService.sendInvite(this.invite).subscribe(
        data => {
          if (data.success) {
            this.loading = false;
            this.router.navigate(['/users']);
          } else {
            console.log(data.message);
            this.loading = true;
          }
        }, error => {
          console.log('Error', error);
        }, () => {
          this.loading = false;
        }
      );
    } else {
      this.markAsTouched(this.userForm);
      this.show = true;
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map((field) => {
      const control = group.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

  add() {
    const checkboxGroup = new FormArray(this.rolelist.map(item => new FormGroup({
      id: new FormControl(item.id),
      text: new FormControl(item.name),
      checkbox: new FormControl(false)
    })));
    // create a hidden reuired formControl to keep status of checkbox group
    const hiddenControl = new FormControl(this.mapItems(checkboxGroup.value), Validators.required);
    // update checkbox group's value to hidden formcontrol
    checkboxGroup.valueChanges.subscribe((v) => {
      hiddenControl.setValue(this.mapItems(v));
    });

    this.form = new FormGroup({
      items: checkboxGroup,
      selectedItems: hiddenControl
    });
  }

  mapItems(items) {
    const selectedItems = items.filter((item) => item.checkbox).map((item) => item.id);
    return selectedItems.length ? selectedItems : null;
  }

  click() {
    this.show = true;
  }
}
