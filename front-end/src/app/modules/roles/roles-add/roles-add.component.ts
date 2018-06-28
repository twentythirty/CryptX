import { Component, OnChanges, SimpleChanges } from '@angular/core';
import _ from 'lodash';

import { RolesService } from '../../../services/roles/roles.service';

import { Role } from '../../../shared/models/role';
import { RolesPermissionsResultData } from '../../../shared/models/api/rolesPermissionsResultData';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-add',
  templateUrl: './roles-add.component.html',
  styleUrls: ['./roles-add.component.scss']
})
export class RolesAddComponent implements OnChanges {
  permissionsMap: RolesPermissionsResultData = {
    total: 0,
    data: []
  };
  permissionsBlocksCheckboxMap = [];
  permissionsCheckboxMap = {};
  roleId: number;
  role: Role = {
    name: '',
    permissions: []
  };
  loading = false;

  constructor(
    private rolesService: RolesService,
    private router: Router
  ) {
    this.rolesService.getPermissionsList().subscribe(result => {
      this.permissionsMap = result;
      result.data.map(data => {
        this.permissionsBlocksCheckboxMap.push( false );

        data.permissions.map(data => {
          this.permissionsCheckboxMap[data.code] = false;
        });
      });
    });
  }

  ngOnChanges() { }

  onPermissionToggle({ value, checked }) {
    this.permissionsCheckboxMap[value] = checked;

    // need change permissionsBlocksCheckboxMap values
    let index;
    let isAllSelected = true;

    _.map( this.permissionsMap.data, (data, i) => {
      _.map( data.permissions, data => {
        if ( data.code === value ) {
          index = i;
        }
      });
    });

    for (let { code } of this.permissionsMap.data[index].permissions) {
      isAllSelected = isAllSelected && this.permissionsCheckboxMap[code];
    }

    this.permissionsBlocksCheckboxMap[index] = isAllSelected;

    this.generatePermissions();
  }

  onPermissionBlockToggle({ value, checked }) {
    _.map( this.permissionsMap.data[value].permissions, o => {
      this.permissionsCheckboxMap[o.code] = checked;
    });

    this.permissionsBlocksCheckboxMap[value] = checked;

    this.generatePermissions();
  }

  generatePermissions() {
    const perm = [];

    for (let key in this.permissionsCheckboxMap) {
      if ( this.permissionsCheckboxMap[key] ) {
        perm.push(key);
      }
    }

    this.role.permissions = perm;
  }

  addRole() {
    this.loading = true;

    this.rolesService.createRole(this.role).subscribe(
      data => {
        this.router.navigate(['/roles']);
      }, error => {
        console.log('Error', error);
      }, () => {
        this.loading = false;
      });
  }

}
