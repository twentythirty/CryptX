import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { Order } from '../../shared/models/order';
import { OrderGroup } from '../../shared/models/orderGroup';

export class OrdersAllResponse {
  success: boolean;
  count: number;
  recipe_orders: Order;
  footer: Array<any>;
}

export class OrderGroupResponse {
  success: boolean;
  recipe_order_group: OrderGroup;
}

export class OrderGroupOfRecipeResponse {
  success: boolean;
  recipe_order_group: OrderGroup;
  recipe_stats?: any;
}

export class AlterOrderGroupRequestData {
  status: 81 | 82 | 83;
  comment: string;
}

@Injectable()
export class OrdersService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  getAllOrders(request: EntitiesFilter): Observable<OrdersAllResponse> {
    return this.http.post<OrdersAllResponse>(this.baseUrl + `orders/all`, request);
  }

  getAllOrdersByGroupId(groupId: number, request?: EntitiesFilter): Observable<OrdersAllResponse> {
    if (request) {
      return this.http.post<OrdersAllResponse>(this.baseUrl + `orders/of_group/${groupId}`, request);
    } else {
      return this.http.get<OrdersAllResponse>(this.baseUrl + `orders/of_group/${groupId}`);
    }
  }

  getOrderGroup(groupId: number): Observable<OrderGroupResponse> {
    return this.http.get<OrderGroupResponse>(this.baseUrl + `orders/${groupId}`);
  }

  /**
   *
   * @param recipeId
   * @param no404Error True if no need that server gives 404 if group not found
   */
  getOrderGroupOfRecipe(recipeId: number, no404Error?: boolean): Observable<OrderGroupOfRecipeResponse> {
    const options = {
      params: {}
    };

    if (no404Error) {
      options.params = {
        check: 'true'
      };
    }

    return this.http.get<OrderGroupOfRecipeResponse>(this.baseUrl + `orders/groups/of_recipe/${recipeId}`, options);
  }

  generateOrders(recipeId: number): Observable<any> { // todo
    return this.http.post<any>(this.baseUrl + `recipes/${recipeId}/generate_orders`, {});
  }

  alterOrderGroup(groupId: number, request: AlterOrderGroupRequestData): Observable<any> {
    return this.http.post<any>(this.baseUrl + `orders/${groupId}/alter`, request);
  }



  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `orders/header_lov/${column_name}`).pipe(
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
}
