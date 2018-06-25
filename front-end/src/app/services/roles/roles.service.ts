import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Role } from '../../shared/models/role';
import { RolesAllRequestData } from '../../shared/models/api/rolesAllRequestData';

export class RolesReponse {
  success: boolean
  roles: Array<Role>
}

@Injectable()
export class RolesService {

  constructor(private http: HttpClient) { }

  getAllRoles(requestData: RolesAllRequestData): Observable<any>{
    return this.http.post<RolesReponse>('/api/v1/roles/all', requestData)
    .do(data => {
      if (data.success) {
        return data.roles;
      }
    });
  }

}
