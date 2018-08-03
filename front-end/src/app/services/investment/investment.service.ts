import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { of } from 'rxjs/observable/of';
import { TimelineEvent } from '../../shared/components/timeline/timeline.component';
import { StatusClass } from '../../shared/models/common';
import { map, tap } from 'rxjs/operators';
import 'rxjs/Rx';


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
    return this.http.post<any>(this.baseUrl + `investments/all`, requestData);
  }

  getAllInvestmentsHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `investments/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov }
            });
          }
          return null;
        }
      )
    );
  }

  getAllRecipes(investment_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `recipes/of_investment/${investment_id}`, requestData);
  }

  getAllRecipeDetails(recipe_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `recipe_details/of_recipe/${recipe_id}`, requestData);
  }

  getAllOrders(recipe_run_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `orders/of_recipe/${recipe_run_id}`, requestData);
  }

  getAllRecipeDeposits(recipe_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `deposits/of_recipe/${recipe_id}`, requestData);
  }

  getAllExecutionOrders(order_detail_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `execution_orders/of_order/${order_detail_id}`, requestData);
  }

  getAllExecutionOrdersHeaderLOV(column_name: string): Observable<any> {
    console.log("i am here")
    return this.http.get<any>(this.baseUrl + `execution_orders/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov }
            });
          }
          return null;
        }
      )
    );
  }


  getAllExecOrdersFills(execution_order_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `exec_orders_fills/of_execution_order/${execution_order_id}`, requestData);
  }

  getAllExecOrders(execution_order_id: any, requestData?: EntitiesFilter): Observable<any>{
    return this.http.post<any>(this.baseUrl + `/execution_orders/of_investment_run/${execution_order_id}`, requestData);
  }

  getAllExecutionOrdersFillsHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `exec_orders_fills/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov }
            });
          }
          return null;
        }
      )
    );
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
   * Get stats
   */

  getInvestmentStats(investment_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `investments/${investment_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['investment'].isCurrent = true; return stats;})
    );
  }

  getRecipeStats(recipe_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipes/${recipe_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['recipe_run'].isCurrent = true; return stats;})
    );
  }

  getOrderStats(order_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `orders/${order_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['orders'].isCurrent = true; return stats;})
    );
  }

  getRecipeDepositStats(recipe_detail_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipe_deposits/${recipe_detail_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['deposits'].isCurrent = true; return stats;})
    );
  }

  getExecutionOrderStats(order_detail_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `execution_orders/${order_detail_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['execution_orders'].isCurrent = true; return stats;})
    );
  }

  getExecOrdersFillStats(exec_order_fill_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `exec_orders_fills/${exec_order_fill_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['execution_orders'].isCurrent = true; return stats;})
    );
  }

  private statsMap = (res) => {
    let stats = res.statistics || {};
    for(let key of ['investment', 'recipe_run', 'deposits', 'orders', 'execution_orders']) {
      if(!stats[key]) stats[key] = { note: 'investment.no_' + key }
    }
    return stats;
  }
  /**
   * Get timeline data
   * Only one of the ID is needed to find investment run
   */

  getAllTimelineData(investment_run: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'investments/timeline', investment_run)
      .map(res => res.statistics)  
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
    .do ( data => {
      return data.statistics;
    });
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

}
