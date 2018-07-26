import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import _ from 'lodash';

import { RolesAllRequestData } from '../../models/api/rolesAllRequestData';

@Component({
  selector: 'app-data-table-common-manager',
  template: ''
})
export class DataTableCommonManagerComponent implements OnInit {
  prevQueryParams: { page?: number } = {};
  
  count: number = 0;
  pageSize: number = 10;
  page: number = 1;

  requestData: RolesAllRequestData = {
    filter: {},
    limit: this.pageSize,
    offset: 0
  };

  constructor(
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams
    .filter(params => !params.page || params.page != this.prevQueryParams.page )
    .subscribe(params => {
      this.page = params.page || 1;
      this.requestData.offset = (this.page - 1) * this.pageSize;
      this.getAllData();

      this.prevQueryParams = params;
    });
  }

  onSetFilter(filterData): void {
    // just to first page
    this.page = 1;
    this.requestData.offset = 0;

    // filter
    if (!this.requestData.filter.and) {
      this.requestData.filter.and = [];
    }

    this.requestData.filter.and = _.filter(
      this.requestData.filter.and,
      item => filterData.column !== item.field
    ).concat(filterData.values);

    // order
    if (!this.requestData.order) {
      this.requestData.order = [];
    }

    this.requestData.order = _.filter(
      this.requestData.order,
      item => filterData.column !== item.by
    );
    if (filterData.order) {
      this.requestData.order.push(filterData.order);
    }

    // update table data
    this.getAllData();
  }

  getAllData() {}

}
