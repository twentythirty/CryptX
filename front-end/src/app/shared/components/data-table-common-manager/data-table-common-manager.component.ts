import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import _ from 'lodash';

import { RolesAllRequestData } from '../../models/api/rolesAllRequestData';

@Component({
  selector: 'app-data-table-common-manager',
  template: ''
})
export class DataTableCommonManagerComponent implements OnInit, OnDestroy {
  private prevQueryParams: { page?: number } = {};
  private orderingCleared: boolean = false;
  private queryParamsSubscription;
  
  public routeParamId: number;
  public count: number = 0;
  public pageSize: number = 10;
  public page: number = 1;

  public requestData: RolesAllRequestData = {
    filter: {},
    order: [
      {
        by: 'id',
        order: 'asc'
      }
    ],
    limit: this.pageSize,
    offset: 0
  };

  constructor(
    public route: ActivatedRoute,
    //private router: Router,
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams
    .filter(params => !params.page || params.page != this.prevQueryParams.page )
    .subscribe(params => {
      this.routeParamId = params.id
      this.page = params.page || 1;
      this.requestData.offset = (this.page - 1) * this.pageSize;
      this.getAllData();

      this.prevQueryParams = params;

    this.route.params.filter(
      (params: Params) => params.id
    ).subscribe(
      (params: Params) => {
        this.routeParamId= params.id;
      }
    ) 
    });
  }

  ngOnDestroy() {
    this.queryParamsSubscription.unsubscribe();
  }

  onSetFilter(filterData): void {
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
      if(!this.orderingCleared) {
        this.requestData.order = []; // clear default ID ordering if user pick any other ordering
        this.orderingCleared = true;
      }
      this.requestData.order.push(filterData.order);
    }

    // just to first page
    this.page = 1;
    this.requestData.offset = 0;

    // update table data
    if(_.isEmpty(this.prevQueryParams) || this.prevQueryParams.page == 1) {
      this.getAllData();
    }

    // this.router.navigate([], {
    //   queryParamsHandling: 'merge',
    //   queryParams: {
    //     page: this.page
    //   },
    //   skipLocationChange: false
    // });
  }

  public getAllData() {}

}
