import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { environment } from '../../../environments/environment';
import { ExchangeAccount } from '../../shared/models/exchangeAccount';

export class ExchangesAllResponse {
  success: boolean;
  exchanges: Array<any>;
  count: number;
}

export class ExchangeAccountsAllResponse {
  success: boolean;
  exchange_accounts: Array<ExchangeAccount>;
  count: number;
  footer: Array<any>;
}

export class ExchangeCredentialsAllResponse {
  success: boolean;
  exchange_credentials: Array<any>;
  count: number;
  footer: Array<any>;
}

export class ExchangesInstrumentIdentifiersResponse {
  identifiers: Array<string>;
  success: boolean;
}

export class SetExchangeCredentialsRequest {
  api_key: string;
  api_secret: string;
  uid: string;
  password: string;
  passphrase: string;
}

export class ExchangeCredentialsResponse {
  success: boolean;
  exchange_credential: {
    id: number;
    exchange_id: number;
    exchange: string;
    api_key: string;
  };
}

export class CredentialFieldsResponse {
  success: boolean;
  fields: CredentialField[];
}

export class CredentialField {
  title: string;
  field_name: string;
  type: string;
}


@Injectable()
export class ExchangesService {
  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) {}

  getAllExchanges(ignore: boolean = false): Observable<ExchangesAllResponse> {
    return this.http.get<ExchangesAllResponse>(this.baseUrl + `exchanges/all/?ignore_unmappable=${ignore}`);
  }

  getExchangeInstrumentIdentifiers(exchangeId): Observable<ExchangesInstrumentIdentifiersResponse> {
    return this.http.get<ExchangesInstrumentIdentifiersResponse>(this.baseUrl + `exchanges/${exchangeId}/instruments`);
  }

  getAllExchangeAccounts(requestData?: EntitiesFilter): Observable<ExchangeAccountsAllResponse> {
    return this.http.post<ExchangeAccountsAllResponse>(this.baseUrl + `exchanges/accounts/all`, requestData);
  }

  getAllExchangeCredentials(requestData?: EntitiesFilter): Observable<ExchangeCredentialsAllResponse> {
    return this.http.post<ExchangeCredentialsAllResponse>(this.baseUrl + `exchanges/credentials/all`, requestData);
  }

  getExchangeCredentials(id: number): Observable<ExchangeCredentialsResponse> {
    return this.http.get<ExchangeCredentialsResponse>(this.baseUrl + `exchanges/${id}/credentials`);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + `exchanges/accounts/header_lov/${column_name}`, {}).pipe(
      map(
        res => {
          if (res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              if (lov !== null) {
                return { value: lov.toString() };
              } else {
                return {value: '-'};
              }
            });
          } else { return null; }
        }
      )
    );
  }

  createExchangeAccount(data: object, id: number): Observable<any> {
    return this.http.post<any>(this.baseUrl + `exchanges/${id}/accounts/create`, data);
  }

  getSingleExchangeAccount(id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `exchanges/accounts/${id}`);
  }

  editExchangeAccountData(data: object, id: number): Observable<any> {
    return this.http.post<any>(this.baseUrl + `exchanges/accounts/${id}/edit`, data);
  }

  setExchangeCredentials(exchangeId: number, data: SetExchangeCredentialsRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl + `exchanges/${exchangeId}/credentials/set`, data);
  }

  deleteExchangeCredentials(exchangeId: number): Observable<any> {
    const data = {
      api_key: null,
      api_secret: null,
      uid: null,
      password: null,
      passphrase: null
    };

    return this.setExchangeCredentials(exchangeId, data);
  }

  getCredentialFields(exchangeId: number): Observable<CredentialFieldsResponse> {
    return this.http.get<CredentialFieldsResponse>(this.baseUrl + `exchanges/${exchangeId}/credential_fields`);
  }

}
