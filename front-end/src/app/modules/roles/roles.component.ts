import { NgModule, Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';

import { RolesService } from '../../services/roles/roles.service';

import { RolesAllRequestData } from '../../shared/models/api/rolesAllRequestData';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
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

  constructor(private rolesService: RolesService) {
   }

  ngOnInit() {
    this.getAllRoles();
  }

  onSetOrderBy(orderBy): void {
    this.rolesRequestData.order = orderBy;

    this.updatePage(1);
    this.getAllRoles();
  }

  goToPage(n: number): void {
    this.updatePage(n);
    this.getAllRoles();
  }

  onNext(): void {
    this.updatePage( this.rolesPage + 1 );
    this.getAllRoles();
  }

  onPrev(): void {
    this.updatePage( this.rolesPage - 1 );
    this.getAllRoles();
  }

  onFirst(): void {
    this.updatePage(1);
    this.getAllRoles();
  }

  onLast(n: number): void {
    this.updatePage(n);
    this.getAllRoles();
  }

  updatePage(page: number) {
    this.rolesPage = page;
    this.rolesRequestData.offset = (page - 1) * this.rolesPageSize;
  }

  getAllRoles(): void {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      this.rolesDataSource.body = res.roles;
      this.rolesCount = res.count;
    });
  }

}

@NgModule({
  declarations: [
    RolesComponent,
    PaginationComponent,
    DataTableComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule
  ],
  providers: [
    
  ]
})
export class RolesModule { }