import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import _ from 'lodash';
import 'rxjs/add/operator/filter';

import { RolesService } from '../../../services/roles/roles.service';

import { Role } from '../../../shared/models/role';
import { RolesPermissionsResultData } from '../../../shared/models/api/rolesPermissionsResultData';

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
  role: Role = {
    name: '',
    permissions: []
  };
  loading = false;
  showDeleteConfirm = false;


  constructor(
    private rolesService: RolesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // generate maps for checkbox value storing
    this.rolesService.getPermissionsList().subscribe(result => {
      this.permissionsMap = result;
      this.generatePermissionsMaps();
    });

    // get roleId from url
    this.route.params
      .filter(params => params.roleId)
      .subscribe( params => {
        this.roleId = params.roleId;

        this.rolesService.getRole(this.roleId).subscribe(data => {
          this.role = data.role;
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

  generatePermissionsMaps() {
    this.permissionsMap.data.map(data => {
      data.permissions.map(data => {
        this.permissionsCheckboxMap[data.code] = _.indexOf( this.role.permissions, data.code ) > -1;
      });
    });

    this.updatePermissionsBlocksCheckboxMap();
  }

  updatePermissionsBlocksCheckboxMap() {
    let isAllSelected = true;

    _.map( this.permissionsMap.data, (data, i) => {
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

  saveRole() {
    this.loading = true;
    this.rolesService.editRole(this.role).subscribe(
      data => {
        this.router.navigate(['/roles']);
      }, error => {
        console.log('Error', error);
      }, () => {
        this.loading = false;
      });
  }

}
