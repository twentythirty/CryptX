import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators/map";

import { EntitiesFilter } from "../../shared/models/api/entitiesFilter";
import { Transfer } from "../../shared/models/transfer";

export class TransfersAllResponse {
  success: boolean;
  transfers: Array<Transfer>;
  footer: Array<any>;
  count: number;
}

@Injectable()
export class ColdStorageService {
  baseUrl: string = environment.baseUrl;

  

  constructor(private http: HttpClient) { }

  getAllTransfers(requestData: EntitiesFilter): Observable<TransfersAllResponse>{
      return this.http.post<TransfersAllResponse>(this.baseUrl + `cold_storage/all`, requestData);
  }

  ConfirmTransfer(transfer: Transfer) {
    return this.http.post<any>(this.baseUrl + `cold_storage/${transfer.id}/approve`, {});
  }

  getAllTransfersHeaderLOV(column_name: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cold_storage/header_lov/${column_name}`, {}).pipe(
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
