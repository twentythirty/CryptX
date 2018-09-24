import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Role } from '../../shared/models/role';
import { RolesAllRequestData } from '../../shared/models/api/rolesAllRequestData';
import { RolesPermissionsResultData } from '../../shared/models/api/rolesPermissionsResultData';
import { RoleResultData } from '../../shared/models/api/roleResultData';
import { environment } from '../../../environments/environment';

export class RolesAllResponse {
  success: boolean;
  roles: Array<Role>;
  count: number;
}

export class RolesCreateResponse {
  success: boolean;
  role: Role;
}

@Injectable()
export class RolesService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAllRoles(requestData: RolesAllRequestData): Observable<any> {
    return this.http.post<RolesAllResponse>(this.baseUrl + 'roles/all', requestData).pipe(
      tap(data => {
        if (data.success) {
          return data.roles;
        }
      })
    );
  }

  getPermissionsList() {
    return this.http.get<RolesPermissionsResultData>(this.baseUrl + 'permissions/list');
  }

  getRole(roleId: number) {
    return this.http.get<RoleResultData>(this.baseUrl + 'roles/' + roleId);
  }

  createRole(role: Role) {
    return this.http.post<RolesCreateResponse>(this.baseUrl + 'roles/create', role).pipe(
      tap(data => {
        if (data.success) {
          return data.role;
        }
      })
    );
  }

  editRole(role: Role) {
    return this.http.post<RolesCreateResponse>(this.baseUrl + 'roles/' + role.id + '/edit', role).pipe(
      tap(data => {
        if (data.success) {
          return data.role;
        }
      })
    );
  }

  deleteRole(roleId: number) {
    return this.http.delete(this.baseUrl + 'roles/' + roleId + '/delete');
  }

}
