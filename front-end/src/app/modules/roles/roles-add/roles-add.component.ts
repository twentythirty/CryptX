import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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

  roleForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    permissions: new FormControl([], Validators.required)
  });

  constructor(
    private rolesService: RolesService,
    public router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
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

    for (const key in this.permissionsCheckboxMap) {
      if (this.permissionsCheckboxMap[key]) {
        perm.push(key);
      }
    }

    this.roleForm.controls.permissions.setValue(perm);
    this.roleForm.controls.permissions.markAsTouched();
  }

  generatePermissionsMaps() {
    this.permissionsMap.data.map(data => {
      data.permissions.map(perm => {
        this.permissionsCheckboxMap[perm.code] = _.indexOf(this.roleForm.value.permissions, perm.code) > -1;
      });
    });

    this.updatePermissionsBlocksCheckboxMap();
  }

  updatePermissionsBlocksCheckboxMap() {
    let isAllSelected = true;

    _.map(this.permissionsMap.data, (data, i) => {
      isAllSelected = true;

      for (const { code } of data.permissions) {
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
    if (this.roleForm.invalid || this.roleForm.value.permissions.length === 0) {
      return;
    }

    this.loading = true;

    this.rolesService.createRole(this.roleForm.value).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/roles']);
        }
      }, error => {
        console.log('Error', error);
        this.loading = false;
      }, () => {
        this.loading = false;
      }
    );
  }

  saveRole() {
    if (this.roleForm.invalid || this.roleForm.value.permissions.length === 0) {
      return;
    }

    this.loading = true;

    const roleEditRequest = Object.assign(this.roleForm.value, {
      id: this.roleId
    });

    this.rolesService.editRole(roleEditRequest).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/roles']);
        }
      }, error => {
        console.log('Error', error);
        this.loading = false;
      }, () => {
        this.loading = false;
      }
    );
  }

}
