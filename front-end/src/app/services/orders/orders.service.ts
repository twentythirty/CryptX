import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { Order } from '../../shared/models/order';

export class OrdersAllResponse {
  success: boolean;
  count: number;
  recipe_orders: Order;
  footer: Array<any>;
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

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `orders/header_lov/${column_name}`).pipe(
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

}
