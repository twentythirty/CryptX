import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { EntitiesFilter } from "../../shared/models/api/entitiesFilter";
import { Observable } from "rxjs/Observable";
import { Deposit, DepositStatus } from "../../shared/models/deposit";
import { map } from "rxjs/operators";

export class DepositsAllResponse {
  success: boolean;
  recipe_deposits: Array<Deposit>;
  footer: Array<any>;
  count: number;
}

export class DepositResultData {
  success: boolean;
  recipe_deposit: Deposit;
  action_logs: Array<DepositStatus>;
}

export class DepositResponseData {
  deposit: any;
  success: any;
}

@Injectable()
export class DepositService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }
  
  getAllDeposits(requestData?: EntitiesFilter): Observable<DepositsAllResponse>{
    if(requestData) {
      return this.http.post<DepositsAllResponse>(this.baseUrl + `deposits/all`, requestData);
    } else {
      return this.http.get<DepositsAllResponse>(this.baseUrl + `deposits/all`);
    }
  }

  getDeposit(depositId: number){
    return this.http.get<DepositResultData>(this.baseUrl + `deposits/${depositId}`);
  }

  Submit(depositId: number, info: object){
    return this.http.post<DepositResponseData>(this.baseUrl + `deposits/${depositId}/submit`,info );
  }

  Approve(depositId: number, info: object){
    return this.http.post<DepositResponseData>(this.baseUrl + `deposits/${depositId}/approve`,info );
  }
  
  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `deposits/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov }
            });
          } else return null;
        }
      )
    )
  }
}
