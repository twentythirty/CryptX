import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgForm, Validators, FormArray, AbstractControl } from '@angular/forms';
import { filter } from 'rxjs/operators';
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
    Firstname: new FormControl('', Validators.required),
    Lastname: new FormControl('', Validators.required),
    Email: new FormControl('', Validators.email),
  });

  userId: number;
  userName: String;
  userSurname: String;
  user: User;
  userRoles = [];
  rolelist = [];
  rolesRequestData: RolesAllRequestData;
  loading = false;
  loading2 = false;
  showDeactivateConfirm = false;
  buttonName: String;
  show = false;

  validation;
  userValidation;

  form: FormGroup;

  constructor(
    private router: Router,
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

      this.user = user;
      this.userForm.controls.Firstname.setValue(this.user.first_name);
      this.userForm.controls.Lastname.setValue(this.user.last_name);
      this.userForm.controls.Email.setValue(this.user.email);
      this.userName = String(this.user.first_name + ' ' + this.user.last_name);

      if (this.user.is_active) {
        this.buttonName = 'Deactivate';
      } else {
        this.buttonName = 'Activate';
      }
      this.userRoles = Object.values(user.roles);

      roles.forEach(role => {
        const obj = {
          id: Number,
          name: String,
          is_active: false
        };
        obj.id = role.id;
        obj.name = role.name;
        this.userRoles.forEach(userrole => {
          if (obj.id === userrole.id) {
            obj.is_active = true;
          }
        });
        this.rolelist.push(obj);
      });
      this.add();
    });
  }

  add() {
    const checkboxGroup = new FormArray(this.rolelist.map(item => new FormGroup({
      id: new FormControl(item.id),
      text: new FormControl(item.name),
      checkbox: new FormControl(item.is_active)
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

  getAllRoles() {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      res.roles.forEach(role => {
        const obj = {
          id: Number,
          name: String,
          is_active: false
        };
        obj.id = role.id;
        obj.name = role.name;
        this.userRoles.forEach(userrole => {
          if (obj.id === userrole.id) {
            obj.is_active = true;
          }
        });
        this.rolelist.push(obj);
      });
    });
  }

  closeDeactivateConfirm() {
    this.showDeactivateConfirm = false;
  }

  saveUser() {
    if (this.form.valid && this.userForm.valid) {
      this.user.roles = this.form.controls.selectedItems.value;
      this.usersService.saveUser(this.user).subscribe(
        data => {
          if (data.success === true) {
            this.loading = false;
            this.router.navigate(['/users']);
          }
        }, error => {
          this.loading = true;
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

  deactivateUser() {
    this.user.roles = this.form.controls.selectedItems.value;
    this.user.is_active = !this.user.is_active;

    this.usersService.saveUser(this.user).subscribe(
      data => {
        if (data.success === true) {
          this.loading = false;
          this.router.navigate(['/users']);
        }
      }, error => {
        this.loading = true;
      }, () => {
      this.loading = false;
    });
  }

  isValid() {
    if (this.form.valid && this.userForm.valid) {
      this.showDeactivateConfirm = true;
    } else {
      this.showDeactivateConfirm = false;
      this.markAsTouched(this.userForm);
      this.show = true;
    }
  }

  click() {
    this.show = true;
  }

}
