import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { EntitiesFilter } from "../../shared/models/api/entitiesFilter";
import { Observable } from "rxjs";
import { Order } from "../../shared/models/order";
import { map } from "rxjs/operators";

export class OrderAllResponse {
    success: boolean;
    execution_orders: Array<Order>;
    footer: Array<any>;
    count: number;
  }

@Injectable()
export class ExecutionOrdersService {

  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAllExecutionOrders(requestData?: EntitiesFilter): Observable<OrderAllResponse>{
      return this.http.post<OrderAllResponse>(this.baseUrl + `execution_orders/all`, requestData);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `execution_orders/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              if (lov !== null){
                return { value: lov.toString() }
              } else {
                return {value: '-'}
              }
            });
          } else return null;
        }
      )
    )
  }

  changeExecutionOrderStatus(id: number, status: number): Observable<any> {
    const request_data = { status };
    return this.http.post<any>(this.baseUrl + `execution_orders/${id}/change_status`, request_data);
  }

}
