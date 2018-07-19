import { Component, OnInit } from '@angular/core';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operator/map';
import { EntitiesFilter } from '../../../shared/models/api/entitiesFilter';
import { Observable } from 'rxjs';

import { UsersService } from '../../../services/users/users.service';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import {
  DateCellComponent,
  DateCellDataColumn,
  StatusCellComponent,
  StatusCellDataColumn,
  PercentCellComponent,
  PercentCellDataColumn
} from '../../../shared/components/data-table-cells';
import { User } from "../../../shared/models/user";
import { StatusClass } from "../../../shared/models/common";


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent extends DataTableCommonManagerComponent implements OnInit {

  public usersDataSource: TableDataSource = {
    header: [
      { column: 'first_name', name: 'Name', filter: { type: 'text', sortable: true, rowData: []}},
      { column: 'last_name', name: 'Surname', filter: { type: 'text', sortable: true, rowData: [] }},
      { column: 'email', name: 'Email', filter: { type: 'text', sortable: true, rowData:[] }},
      { column: 'created_timestamp', name: 'Creation date', filter: { type: 'date', sortable: true}},
      { column: 'is_active', name: 'Status', filter: { type: 'boolean', sortable: true, rowData: [{value: true, label: 'Active'},{value: false, label: 'Inactive'}] }}
    ],
    body: [],
  };
  public usersColumnsToShow: Array<string | TableDataColumn> = [
    'first_name',
    'last_name',
    'email',
     new DateCellDataColumn({ column: 'created_timestamp' }),
     'is_active',
     /*new StatusCellDataColumn({ column: 'is_active', inputs: { classMap: {
      'users.entity.inactive': StatusClass.DEACTIVATED,
      'users.entity.active': StatusClass.ACTIVE,
    }}}),*/
  ];

  constructor(
    private userService: UsersService,
    public route: ActivatedRoute,
    public router: Router,

  ) {
    super(route);
  }

  getAllData(): void {
    this.userService.getAllUsers(this.requestData).subscribe(res => {
      this.usersDataSource.body = res.users;
      this.count = res.count;
        if(res.footer) {
          this.usersDataSource.footer = this.usersColumnsToShow.map(col => {
            let key = (typeof col == 'string') ? col : col.column;
            return res.footer.find(f => f.name == key) || '';
          })
        }
    });
  }

  public openRow(users: User): void {
    this.router.navigate(['/users/edit', users.id])
  }
}
