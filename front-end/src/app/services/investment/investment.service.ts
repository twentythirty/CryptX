import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { TranslateService } from '@ngx-translate/core';
import { ActionLog } from '../../shared/models/actionLog';
import { Conversion } from '../../shared/models/conversion';

export class ExecutionOrderFillResultData {
  success: boolean;
  execution_order: any;
  action_logs: Array<ActionLog>;
}

export class ConversionsAllResponse {
  success: boolean;
  conversions: Array<Conversion>;
  footer: Array<any>;
  count: number;
}

export class ConversionSubmitResponse {
  success: boolean;
  conversion?: Conversion;
  error?: string;
}

export class ConversionCompleteResponse {
  success: boolean;
  conversion: Conversion;
}

export class CalculateDepositsResponse {
  success: boolean;
  deposits: Array<{
    id: number;
    amount: string;
    creation_timestamp: string;
    status: number;
    recipe_run_id: number;
    asset_id: number;
    target_exchange_account_id: number;
  }>;
}


export enum AssetConversionStatus {
  Pending = 'asset_conversions.status.501',
  Completed = 'asset_conversions.status.502'
}


@Injectable()
export class InvestmentService {

  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) {}

  /**
   * Create and investment
   */

  createInvestmentRun(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/create`, data);
  }

  /**
   * Lists with(out) filters
   */

  getAllInvestments(requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/all`, requestData);
  }

  getAllInvestmentsHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          }
          return null;
        }
      )
    );
  }

  getAllRecipes(investment_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `recipes/of_investment/${investment_id}`, requestData);
  }

  getAllRecipeDetails(recipe_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `recipe_details/of_recipe/${recipe_id}`, requestData);
  }

  getAllOrders(recipe_run_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `orders/of_recipe/${recipe_run_id}`, requestData);
  }

  getAllRecipeDeposits(recipe_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `deposits/of_recipe/${recipe_id}`, requestData);
  }

  getAllExecutionOrders(order_detail_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `execution_orders/of_order/${order_detail_id}`, requestData);
  }

  getAllExecutionOrdersHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `execution_orders/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          }
          return null;
        }
      )
    );
  }


  getAllExecOrdersFills(execution_order_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `exec_orders_fills/of_execution_order/${execution_order_id}`, requestData);
  }

  getAllExecOrders(investment_run_id: any, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `execution_orders/of_investment_run/${investment_run_id}`, requestData);
  }

  getAllExecutionOrdersFillsHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `exec_orders_fills/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          }
          return null;
        }
      )
    );
  }

  getAllRecipeDetailsHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `recipe_details/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          }
          return null;
        }
      )
    );
  }

  getAllDepositDetailsHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `deposits/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          }
          return null;
        }
      )
    );
  }

  getAllOrdersHeaderLOV(column_name: string, requestData?: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `orders/header_lov/${column_name}`, requestData).pipe(
      map(
        res => {
          if (res && res.lov && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
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

  getSingleInvestment(investment_id: number, requestData: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/${investment_id}`, requestData).pipe(
      tap(data => this.appendRowNumberData(data, requestData))
    );
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
    return this.http.get<any>(this.baseUrl + `execution_orders/${order_detail_id}`).pipe(
      tap(data => this.translateStatus(data))
    );
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
      map(stats => {stats['investment'].isCurrent = true; return stats; })
    );
  }

  getRecipeStats(recipe_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipes/${recipe_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['recipe_run'].isCurrent = true; return stats; })
    );
  }

  getOrderStats(order_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `orders/${order_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['orders'].isCurrent = true; return stats; })
    );
  }

  getRecipeDepositStats(recipe_detail_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipe_deposits/${recipe_detail_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['deposits'].isCurrent = true; return stats; })
    );
  }

  getExecutionOrderStats(order_detail_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `execution_orders/${order_detail_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['execution_orders'].isCurrent = true; return stats; })
    );
  }

  getExecOrdersFillStats(exec_order_fill_id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `exec_orders_fills/${exec_order_fill_id}/stats`).pipe(
      map(this.statsMap),
      map(stats => {stats['execution_orders'].isCurrent = true; return stats; })
    );
  }

  private statsMap = (res) => {
    const stats = res.statistics || {};
    for (const key of ['investment', 'recipe_run', 'deposits', 'orders', 'execution_orders']) {
      if (!stats[key]) { stats[key] = { note: 'investment.no_' + key }; }
    }
    return stats;
  }

  createAssetMix(request: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/select_assets`, request);
  }

  getAssetMix(asset_group_id: number, requestData?: EntitiesFilter): Observable<any> {
    return this.http.post<any>(this.baseUrl + `assets/detailed/of_investment_asset_group/${asset_group_id}`, requestData).pipe(
      tap(data => this.appendRowNumberData(data, requestData))
    );
  }

  private appendRowNumberData(data, requestData: EntitiesFilter) {
    let iterator = requestData.offset;
    let assets = data.assets ? data.assets : data.asset_mix;

    assets = assets.map(item => {
      item.row_number = ++iterator;
      return item;
    });

    // copy "symbol" column footer value
    data.footer.push(
      Object.assign(
        {},
        data.footer.find(item => item.name === 'symbol'),
        { name : 'row_number' }
      )
    );

    return data;
  }

  getDepositAmounts(investments_id: number): Observable<any> {
    return this.http.post<any>(this.baseUrl + `investments/${investments_id}/deposit_amounts`, {});
  }
  /**
   * Get timeline data
   * Only one of the ID is needed to find investment run
   */

  getAllTimelineData(investment_run: object): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'investments/timeline', investment_run).pipe(
      map(res => res.timeline)
    );
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
    return this.http.get<any>(this.baseUrl + `recipes/${recipe_id}/details`).pipe(
      tap(data => {
        return data.statistics;
      })
    );
  }

  approveRecipe(recipe_id: any, data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `recipes/${recipe_id}/approve`, data);
  }

  /**
   * No idea what this is
   */

  getRecipeDetailByDetailId(recipe_detail_id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipe_details/${recipe_detail_id}`);
  }

  /**
   * Wut
   */

  alterOrderGroup(order_group_id: any, data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `orders/${order_group_id}/alter`, data);
  }

  private translateStatus(data: ExecutionOrderFillResultData): ExecutionOrderFillResultData {
    data.action_logs = data.action_logs.map(item => {
      if (item.translationArgs) {
        if (/(^\{|\}$)/.test(item.translationArgs.prev_value)) {
          this.translate.get(_.trim(item.translationArgs.prev_value, '{}')).subscribe(value => item.translationArgs.prev_value = value);
        }
        if (/(^\{|\}$)/.test(item.translationArgs.new_value)) {
          this.translate.get(_.trim(item.translationArgs.new_value, '{}')).subscribe(value => item.translationArgs.new_value = value);
        }
      }
      return item;
    });

    return data;
  }

  getAllConversions(recipeId: number, requestData?: EntitiesFilter): Observable<ConversionsAllResponse> {
    return this.http.post<ConversionsAllResponse>(this.baseUrl + `conversions/of_recipe/${recipeId}`, requestData);
  }

  submitAssetConversion(conversionId: number, amount: number): Observable<ConversionSubmitResponse> {
    return this.http.post<ConversionSubmitResponse>(this.baseUrl + `conversions/${conversionId}/submit`, { amount: amount });
  }

  completeAssetConversion(conversionId: number, amount: number): Observable<ConversionCompleteResponse> {
    return this.http.post<ConversionCompleteResponse>(this.baseUrl + `conversions/${conversionId}/complete`, { amount: amount });
  }

  calculateDeposits(recipeId: number): Observable<CalculateDepositsResponse> {
    return this.http.post<CalculateDepositsResponse>(this.baseUrl + `recipes/${recipeId}/calculate_deposits`, {});
  }

}
