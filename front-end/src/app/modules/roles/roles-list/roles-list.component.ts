import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';

import { RolesService } from '../../../services/roles/roles.service';

import { TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent extends DataTableCommonManagerComponent {
  rolesDataSource: TableDataSource = {
    header: [
      { column: 'name', nameKey: 'table.header.role_name', filter: { type: 'text', sortable: true } }
    ],
    body: []
  };
  rolesColumnsToShow = ['name'];

  constructor(
    public route: ActivatedRoute,
    private rolesService: RolesService
  ) {
    super(route);
  }

  getAllData(): void {
    this.rolesService.getAllRoles(this.requestData).subscribe(res => {
      this.rolesDataSource.body = res.roles;
      this.count = res.count;
    });
  }

}
