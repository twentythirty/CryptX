import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

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
      { column: 'name', nameKey: 'table.header.role_name', column_class: 'column-align-left', filter: { type: 'text', sortable: true } }
    ],
    body: null,
  };

  public rolesColumnsToShow:  Array<TableDataColumn> = [
    new TableDataColumn({ column: 'name' }),
  ];


  constructor(
    public route: ActivatedRoute,
    private rolesService: RolesService,
    public router: Router,
  ) {
    super(route, router);
  }

  getAllData(): void {
    this.rolesService.getAllRoles(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(res => {
      Object.assign(this.rolesDataSource, {
        body: res.roles,
        footer: res.footer
      });
      this.count = res.count;
    });
  }

  public openRow(roles: Role): void {
    this.router.navigate(['/roles/edit', roles.id]);
  }

}
