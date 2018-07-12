import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';

@Injectable()
export class InvestmentService {

  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  // /investments/create

  getAllInvestments(requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `investments/all`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `investments/all`);
    }
  }

  getAllRecipes(investment_id: any, requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `recipes/of_investment/${investment_id}`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `recipes/of_investment/${investment_id}`);
    }
  }

  getAllRecipeDetails(recipe_id: any, requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `recipe_details/of_recipe/${recipe_id}`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `recipe_details/of_recipe/${recipe_id}`);
    }
  }

  getAllOrders(recipe_run_id: any, requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `orders/of_recipe/${recipe_run_id}`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `orders/of_recipe/${recipe_run_id}`);
    }
  }

  getAllRecipeDeposits(recipe_id: any, requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `recipe_deposits/of_recipe/${recipe_id}`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `recipe_deposits/of_recipe/${recipe_id}`);
    }
  }

  getAllExecutionOrders(order_detail_id: any, requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `execution_orders/of_order/${order_detail_id}`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `execution_orders/of_order/${order_detail_id}`);
    }
  }

  getAllExecOrdersFills(execution_order_id: any, requestData?: EntitiesFilter): Observable<any>{
    if(requestData) {
      return this.http.post<any>(this.baseUrl + `exec_orders_fills/of_execution_order/${execution_order_id}`, requestData);
    } else {
      return this.http.get<any>(this.baseUrl + `exec_orders_fills/of_execution_order/${execution_order_id}`);
    }
  }

  // get /investments/:investment_id
  // get /recipes/:recipe_id
  // get /orders/:order_id
  // get /recipe_deposits/:recipe_detail_id
  // get /execution_orders/:order_detail_id
  // get /exec_orders_fills/:exec_order_fill_id


  // /investments/:investment_id/start_recipe_run

  // get /recipes/:recipe_id/details
  // /recipes/:recipe_id/approve"

  // get /recipe_details/:recipe_detail_id

  // /orders/:order_group_id/alter




}
