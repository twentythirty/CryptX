import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { Transfer } from '../../shared/models/transfer';
import { ColdStorageAccountRequestData } from '../../shared/models/api/coldStorageAccountRequestData';
import { ColdStorageCustodianRequestData } from '../../shared/models/api/coldStorageCustodianRequestData';

export class TransfersAllResponse {
  success: boolean;
  transfers: Array<Transfer>;
  footer: Array<any>;
  count: number;
}

export class AccountsAllResponse {
  success: boolean;
  accounts: Array<any>;
  footer: Array<any>;
  count: number;
}

export class CustodiansAllResponse {
  success: boolean;
  custodians: Array<any>;
  footer: Array<any>;
  count: number;
}

export class StorageFeesAllResponse {
  success: boolean;
  fees: Array<any>;
  footer: Array<any>;
  count: number;
}

export class AddAccountResponse {
  success: boolean;
  account: any;
  error?: string;
}

export class AddCustodianResponse {
  success: boolean;
  custodian: any;
  error?: string;
}

@Injectable()
export class ColdStorageService {

  baseUrl: string = environment.baseUrl;


  constructor(private http: HttpClient) { }

  // Cold Storage Transfers

  getAllTransfers(requestData: EntitiesFilter): Observable<TransfersAllResponse> {
    return this.http.post<TransfersAllResponse>(this.baseUrl + `cold_storage/all`, requestData);
  }

  confirmTransfer(transfer: Transfer) {
    return this.http.post<any>(this.baseUrl + `cold_storage/${transfer.id}/approve`, {});
  }

  getAllTransfersHeaderLOV(column_name: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cold_storage/header_lov/${column_name}`, {}).pipe(
      map(
        res => {
          if (res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          } else { return null; }
        }
      )
    );
  }

  // Cold Storage Accounts

  getAllAccounts(requestData: EntitiesFilter): Observable<AccountsAllResponse> {
      return this.http.post<AccountsAllResponse>(this.baseUrl + `cold_storage/accounts/all`, requestData);
  }

  getAllAccountsHeaderLOV(column_name: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cold_storage/accounts/header_lov/${column_name}`, {}).pipe(
      map(
        res => {
          if (res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          } else { return null; }
        }
      )
    );
  }

  addAccount(request: ColdStorageAccountRequestData): Observable<AddAccountResponse> {
    return this.http.post<AddAccountResponse>(this.baseUrl + `cold_storage/accounts/add`, request);
  }

  // Cold Storage Account Storage Fees

  getAllStorageFees(requestData: EntitiesFilter): Observable<StorageFeesAllResponse> {
    return this.http.post<StorageFeesAllResponse>(this.baseUrl + `cold_storage/accounts/fees`, requestData);
  }

  getAllStorageFeesHeaderLOV(column_name: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cold_storage/fees/header_lov/${column_name}`, {}).pipe(
      map(
        res => {
          if (res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              return { value: lov.toString() };
            });
          } else { return null; }
        }
      )
    );
  }

  // Cold Storage Custodians

  getAllCustodians(requestData?: EntitiesFilter): Observable<CustodiansAllResponse> {
    return this.http.post<CustodiansAllResponse>(this.baseUrl + 'cold_storage/custodians/all', requestData);
  }

  addCustodian(request: ColdStorageCustodianRequestData): Observable<AddCustodianResponse> {
    return this.http.post<AddCustodianResponse>(this.baseUrl + '/cold_storage/custodians/add', request);
  }

}
