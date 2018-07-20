import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { of } from 'rxjs/observable/of';
import { TimelineEvent } from '../../modules/investment/timeline/timeline.component';
import { StatusClass } from '../../shared/models/common';

@Injectable()
export class InvestmentService {

  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Create and investment
   */

  createInvestmentRun(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/create`, data);
  }

  /**
   * Lists with(out) filters
   */

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

  /**
   * Get single entities
   */

  getSingleInvestment(investment_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `investments/${investment_id}`);
  }

  getSingleRecipe(recipe_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipes/${recipe_id}`);
  }

  getSingleOrder(order_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `orders/${order_id}`);
  }

  getSingleRecipeDeposit(recipe_detail_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipe_deposits/${recipe_detail_id}`);
  }

  getSingleExecutionOrder(order_detail_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `execution_orders/${order_detail_id}`);
  }

  getSingleExecOrdersFill(exec_order_fill_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `exec_orders_fills/${exec_order_fill_id}`);
  }

  /**
   * Start recipe run
   */

  createRecipeRun(investment_id: any, data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/${investment_id}/start_recipe_run`, data);
  }

  /**
   * Recipe run methods
   */

  getRecipeDetails(recipe_id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipes/${recipe_id}/details`)
  }

  approveRecipe(recipe_id: any, data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `recipes/${recipe_id}/approve`, data)
  }

  /**
   * No idea what this is
   */

  getRecipeDetailByDetailId(recipe_detail_id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipe_details/${recipe_detail_id}`)
  }

  /**
   * Wut
   */

  alterOrderGroup(order_group_id: any, data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `orders/${order_group_id}/alter`, data)
  }

  /**
   * Timeline data
   */

  // TODO: Normal API route
  getTimelineData(): Observable<Array<TimelineEvent>> {
    return of([
      new TimelineEvent('Investment run', 'Orders filled', StatusClass.APPROVED, 'IR-001, rci', (new Date()).toUTCString(), `/run/investment/${1}`),
      new TimelineEvent('Recipe run', 'Pending', StatusClass.PENDING, 'IR-001, rci', (new Date()).toUTCString(), `/run/recipe/${1}`, true),
      new TimelineEvent('Deposit management', 'Pending', StatusClass.PENDING, 'IR-001, rci', (new Date()).toUTCString(), `/run/deposit/${1}`),
      new TimelineEvent('Order', 'Pending', StatusClass.PENDING, 'IR-001, rci', (new Date()).toUTCString(), `/run/order/${1}`),
      new TimelineEvent('Execution order', 'Pending', StatusClass.PENDING, 'IR-001, rci', (new Date()).toUTCString(), `/run/execution-order/${1}`),
    ])
  }

}
