import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';

import { RolesService } from '../../../services/roles/roles.service';

import { RolesAllRequestData } from '../../../shared/models/api/rolesAllRequestData';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  private _prevQueryParams: { page?: number } = {};

  rolesDataSource = {
    header: [
      { column: 'name', name: 'Role name' }
    ],
    body: [],
    footer: []
  };
  rolesColumnsToShow = ['name'];

  rolesCount: number = 0;
  rolesPageSize: number = 10;
  rolesPage: number = 1;

  rolesRequestData: RolesAllRequestData = {
    limit: this.rolesPageSize,
    offset: 0
  };

  constructor(
    private route: ActivatedRoute,
    private rolesService: RolesService
  ) { }

  ngOnInit() {
    this.route.queryParams
      .filter(params => !params.page || params.page != this._prevQueryParams.page )
      .subscribe(params => {
        this.rolesPage = params.page || 1;
        this.rolesRequestData.offset = (this.rolesPage - 1) * this.rolesPageSize;
        this.getAllRoles();

        this._prevQueryParams = params;
      });
  }

  onSetOrderBy(orderBy): void {
    this.rolesPage = 1;
    this.rolesRequestData.order = orderBy;
    this.rolesRequestData.offset = 0;
  }

  getAllRoles(): void {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      this.rolesDataSource.body = res.roles;
      this.rolesCount = 75;//res.count;
    });
  }

}