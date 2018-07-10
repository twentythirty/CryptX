import { Component, OnInit } from '@angular/core';
import { DataTableComponent, TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { ActivatedRoute } from '@angular/router';

import { UsersService } from '../../../services/users/users.service';
import { RolesAllRequestData } from '../../../shared/models/api/rolesAllRequestData';
import { User } from '../../../shared/models/user';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent extends DataTableCommonManagerComponent implements OnInit {

  constructor(private userService: UsersService, public route: ActivatedRoute) { super(route);}


  usersDataSource: TableDataSource = {
    header: [
      { column: 'first_name', name: 'name', filter: { type: 'text', sortable: true }},
      { column: 'last_name', name: 'surname', filter: { type: 'text', sortable: true}},
      { column: 'email', name: 'email', filter: { type: 'text', sortable: true}},
      { column: 'created_at', name: 'creation date', filter: { type: 'date', sortable: true}},
      { column: 'is_active', name: 'status', filter: { type: 'text', sortable: true}}
    ],
    body: [{}],
    footer: [
    ]
  };
  usersColumnsToShow = ['first_name', 'last_name', 'email', 'created_timestamp', 'is_active'];


  getAllData(): void {
    this.userService.getAllUsers(this.requestData).subscribe(res => {
      this.count = res.count;
      this.usersDataSource.body = res.users;
      let filter = this.usersDataSource.body;
    });
  }

}
