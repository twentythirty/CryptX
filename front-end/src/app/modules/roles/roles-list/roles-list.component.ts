import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/filter';

import { RolesService } from '../../../services/roles/roles.service';

import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { Role } from "../../../shared/models/role";

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
    body: null,
  };

  public rolesColumnsToShow: Array<string | TableDataColumn> = [
    'name',
  ];

  constructor(
    public route: ActivatedRoute,
    private rolesService: RolesService,
    private router: Router
  ) {
    super(route);
  }

  getAllData(): void {
    this.rolesService.getAllRoles(this.requestData).subscribe(res => {
      this.rolesDataSource.body = res.roles;
      this.count = res.count;
      if(res.footer) {
        this.rolesDataSource.footer = this.rolesColumnsToShow.map(col => {
            let key = (typeof col == 'string') ? col : col.column;
            return res.footer.find(f => f.name == key) || '';
        })
      }
    });
  }

  public openRow(roles: Role): void {
    this.router.navigate(['/roles/edit', roles.id]);
  }

}
