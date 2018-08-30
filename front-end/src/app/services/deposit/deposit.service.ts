import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import * as _ from 'lodash';

import { environment } from "../../../environments/environment";
import { EntitiesFilter } from "../../shared/models/api/entitiesFilter";
import { Deposit } from "../../shared/models/deposit";
import { TranslateService } from '@ngx-translate/core';
import { ActionLog } from '../../shared/models/actionLog';

export class DepositsAllResponse {
  success: boolean;
  recipe_deposits: Array<Deposit>;
  footer: Array<any>;
  count: number;
}

export class DepositResultData {
  success: boolean;
  recipe_deposit: Deposit;
  action_logs: Array<ActionLog>;
}

export class DepositResponseData {
  deposit: any;
  success: any;
}

@Injectable()
export class DepositService {
  baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) { }
  
  getAllDeposits(requestData?: EntitiesFilter): Observable<DepositsAllResponse>{
    if(requestData) {
      return this.http.post<DepositsAllResponse>(this.baseUrl + `deposits/all`, requestData);
    } else {
      return this.http.get<DepositsAllResponse>(this.baseUrl + `deposits/all`);
    }
  }

  getDeposit(depositId: number): Observable<DepositResultData> {
    return this.http.get<DepositResultData>(this.baseUrl + `deposits/${depositId}`).pipe(
      tap(data => this.translateStatus(data))
    );
  }

  private translateStatus(data: DepositResultData): DepositResultData {
    data.action_logs = data.action_logs.map(item => {
      if(item.translationArgs) {
        if(/(^\{|\}$)/.test(item.translationArgs.prev_value)) {
          this.translate.get(_.trim(item.translationArgs.prev_value, '{}')).subscribe(value => item.translationArgs.prev_value = value);
        }
        if(/(^\{|\}$)/.test(item.translationArgs.new_value)) {
          this.translate.get(_.trim(item.translationArgs.new_value, '{}')).subscribe(value => item.translationArgs.new_value = value);
        }
      }
      return item;
    });

    return data;
  }

  Submit(depositId: number, info: object) {
    return this.http.post<DepositResponseData>(this.baseUrl + `deposits/${depositId}/submit`, info);
  }

  Approve(depositId: number, info: object) {
    return this.http.post<DepositResponseData>(this.baseUrl + `deposits/${depositId}/approve`, info);
  }
  
  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `deposits/header_lov/${column_name}`).pipe(
      map(
        res => {
          if(res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() }
            });
          } else return null;
        }
      )
    )
  }
}
