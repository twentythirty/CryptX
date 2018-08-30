import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { RolesPermissionsResultData } from '../../../shared/models/api/rolesPermissionsResultData';
import { RolesService } from '../../../services/roles/roles.service';

@Component({
  selector: 'app-roles-add',
  templateUrl: './roles-add.component.html',
  styleUrls: ['./roles-add.component.scss']
})
export class RolesAddComponent implements OnInit {
  permissionsMap: RolesPermissionsResultData = {
    total: 0,
    data: []
  };
  permissionsBlocksCheckboxMap = [];
  permissionsCheckboxMap = {};
  roleId: number;
  loading = false;
  showDeleteConfirm = false;
  showError = false;

  roleForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    permissions: new FormControl([])
  });

  constructor(
    private rolesService: RolesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // generate maps for checkbox value storing
    this.rolesService.getPermissionsList().subscribe(result => {
      this.permissionsMap = result;
      this.generatePermissionsMaps();
    });

    // get roleId from url
    this.route.params.pipe(
      filter(params => params.roleId)
    ).subscribe(params => {
      this.roleId = params.roleId;

      this.rolesService.getRole(this.roleId).subscribe(data => {
        this.roleForm.controls.name.setValue(data.role.name);
        this.roleForm.controls.permissions.setValue(data.role.permissions);
        this.generatePermissionsMaps();
      });
    });
  }

  ngOnInit() { }

  onPermissionToggle({ value, checked }) {
    this.permissionsCheckboxMap[value] = checked;
    // need change permissionsBlocksCheckboxMap values
    this.updatePermissionsBlocksCheckboxMap();
    this.generatePermissions();
  }

  onPermissionBlockToggle({ value, checked }) {
    _.map(this.permissionsMap.data[value].permissions, o => {
      this.permissionsCheckboxMap[o.code] = checked;
    });

    this.permissionsBlocksCheckboxMap[value] = checked;

    this.generatePermissions();
  }

  generatePermissions() {
    const perm = [];

    for (let key in this.permissionsCheckboxMap) {
      if (this.permissionsCheckboxMap[key]) {
        perm.push(key);
      }
    }

    this.roleForm.controls.permissions.setValue(perm);
    //this.role.permissions = perm;
    this.checkPermission();
  }

  generatePermissionsMaps() {
    this.permissionsMap.data.map(data => {
      data.permissions.map(data => {
        this.permissionsCheckboxMap[data.code] = _.indexOf(this.roleForm.value.permissions, data.code) > -1;
      });
    });

    this.updatePermissionsBlocksCheckboxMap();
  }

  updatePermissionsBlocksCheckboxMap() {
    let isAllSelected = true;

    _.map(this.permissionsMap.data, (data, i) => {
      isAllSelected = true;

      for (let { code } of data.permissions) {
        isAllSelected = isAllSelected && this.permissionsCheckboxMap[code];
      }

      this.permissionsBlocksCheckboxMap[i] = isAllSelected;
    });
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
  }

  deleteRole() {
    this.rolesService.deleteRole(this.roleId).subscribe(
      data => {
        this.router.navigate(['/roles']);
      }, error => {
        console.log('Error:', error);
      }
    );
  }

  addRole() {
    if (this.roleForm.valid && this.roleForm.value.permissions.length > 0) {
      this.showError = false;
      this.loading = true;

      this.rolesService.createRole(this.roleForm.value).subscribe(
        data => {
          this.router.navigate(['/roles']);
        }, error => {
          console.log('Error', error);
          this.loading = false;
        }, () => {
          this.loading = false;
        });
    } else {
      this.markAsTouched(this.roleForm);
      if (this.roleForm.value.permissions.length === 0) {
        this.showError = true;
      } else {
        this.showError = false;
      }
    }
  }

  saveRole() {
    if (this.roleForm.valid && this.roleForm.value.permissions.length > 0) {
      this.showError = false;
      this.loading = true;

      const roleEditRequest = Object.assign(this.roleForm.value, {
        id: this.roleId
      });

      this.rolesService.editRole(roleEditRequest).subscribe(
        data => {
          this.router.navigate(['/roles']);
        }, error => {
          console.log('Error', error);
          this.loading = false;
        }, () => {
          this.loading = false;
        });
    } else {
      this.markAsTouched(this.roleForm);
      if (this.roleForm.value.permissions.length === 0) {
        this.showError = true;
      } else {
        this.showError = false;
      }
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

  checkPermission(){
    if (this.roleForm.value.permissions.length === 0){
      this.showError = true;
    } else {
      this.showError = false;
    }
  }

}
