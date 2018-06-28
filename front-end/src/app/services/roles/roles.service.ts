import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Role } from '../../shared/models/role';
import { RolesAllRequestData } from '../../shared/models/api/rolesAllRequestData';
import { RolesPermissionsResultData } from '../../shared/models/api/rolesPermissionsResultData';

export class RolesAllResponse {
  success: boolean
  roles: Array<Role>
}

export class RolesCreateResponse {
  success: boolean
  role: Role
}

@Injectable()
export class RolesService {
  baseUrl: string = 'api/v1/';

  constructor(private http: HttpClient) { }

  getAllRoles(requestData: RolesAllRequestData): Observable<any>{
    return this.http.post<RolesAllResponse>(this.baseUrl + 'roles/all', requestData)
    .do(data => {
      if (data.success) {
        return data.roles;
      }
    });
  }

  getPermissionsList() {
    return this.http.get<RolesPermissionsResultData>(this.baseUrl + 'permissions/list');
  }

  createRole(role: Role) {
    return this.http.post<RolesCreateResponse>(this.baseUrl + 'roles/create', role)
    .do(data => {
      if (data.success) {
        return data.role;
      }
    });
  }

}
