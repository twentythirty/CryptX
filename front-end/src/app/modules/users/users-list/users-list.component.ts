import { Component } from '@angular/core';
import { TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { ActivatedRoute } from '@angular/router';

import { UsersService } from '../../../services/users/users.service';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent extends DataTableCommonManagerComponent {
  usersDataSource: TableDataSource = {
    header: [
      { column: 'first_name', name: 'Name', filter: { type: 'text', sortable: true, rowData:[{value:'test'},{value:'last'}] }},
      { column: 'last_name', name: 'Surname', filter: { type: 'text', sortable: true}},
      { column: 'email', name: 'Email', filter: { type: 'text', sortable: true}},
      { column: 'created_timestamp', name: 'Creation date', filter: { type: 'date', sortable: true}},
      { column: 'is_active', name: 'Status', filter: { type: 'boolean', sortable: true, rowData: [{value: true},{value: false, label: 'Inactive'}] }}
    ],
    body: [],
    footer: []
  };
  usersColumnsToShow = ['first_name', 'last_name', 'email', 'created_timestamp', 'is_active'];

  constructor(
    private userService: UsersService,
    public route: ActivatedRoute
  ) {
    super(route);
  }

  getAllData(): void {
    this.userService.getAllUsers(this.requestData).subscribe(res => {
      this.usersDataSource.body = res.users;
      this.count = res.count;
    });
  }

}
