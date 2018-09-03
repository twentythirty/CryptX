import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { UsersService } from '../../../services/users/users.service';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import {
  DateCellDataColumn,
  StatusCellDataColumn,
} from '../../../shared/components/data-table-cells';
import { User } from '../../../shared/models/user';


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent extends DataTableCommonManagerComponent implements OnInit {

  public usersDataSource: TableDataSource = {
    header: [
      { column: 'first_name', nameKey: 'table.header.name', filter: { type: 'text', sortable: true, rowData: []}},
      { column: 'last_name', nameKey: 'table.header.surname', filter: { type: 'text', sortable: true, rowData: [] }},
      { column: 'email', nameKey: 'table.header.email', filter: { type: 'text', sortable: true, rowData: [] }},
      { column: 'created_timestamp', nameKey: 'table.header.creation_date', filter: { type: 'date', sortable: true}},
      { column: 'is_active', nameKey: 'table.header.status', filter: { type: 'text', sortable: true, rowData: [] }}
    ],
    body: null
  };
  public usersColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'first_name' }),
    new TableDataColumn({ column: 'last_name' }),
    new TableDataColumn({ column: 'email' }),
    new DateCellDataColumn({ column: 'created_timestamp' }),
    new StatusCellDataColumn({ column: 'is_active'}),
  ];

  constructor(
    private userService: UsersService,
    public route: ActivatedRoute,
    public router: Router,
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getAllData(): void {
    this.userService.getAllUsers(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    )
    .subscribe(res => {
      Object.assign(this.usersDataSource, {
        body: res.users,
        footer: res.footer
      });
      this.count = res.count;
    });
  }

  getFilterLOV(): void {
    this.usersDataSource.header.filter(
      col => col.filter && (col.filter.type === 'text' || col.filter.type === 'boolean')
    ).map(
      col => {
        col.filter.rowData$ = this.userService.getHeaderLOV(col.column);
      }
    );
  }

  public openRow(users: User): void {
    this.router.navigate(['/users/edit', users.id]);
  }
}
