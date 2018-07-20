import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../../shared/models/user';
import { UserResultData } from '../../shared/models/api/userResultData';
import { RoleResultData } from '../../shared/models/api/roleResultData';
import { RolesPermissionsResultData } from '../../shared/models/api/rolesPermissionsResultData';
import { RolesAllRequestData } from "../../shared/models/api/rolesAllRequestData";
import { environment } from '../../../environments/environment';
import { EntitiesFilter } from "../../shared/models/api/entitiesFilter";


export class UsersAllResponse {
  success: boolean;
  users: Array<User>;
  footer: Array<any>
  count: number;
}

export class UserCreateResponse {
  success: boolean
  user: User
}

export class UserRoleResponse {
  success: boolean
  list: Array<String>
}

export class UserInviteResponse {
  success: boolean
  message: String
}


@Injectable()
export class UsersService {
    baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAllUsers(requestData?: EntitiesFilter): Observable<UsersAllResponse>{
    return this.http.post<UsersAllResponse>(this.baseUrl + 'users/all', requestData)
    .do(data => {
      if (data.success) {
        return data;
      }
    if(requestData) {
      return this.http.post<UsersAllResponse>(this.baseUrl + `assets/detailed/all`, requestData);
    } else {
      return this.http.get<UsersAllResponse>(this.baseUrl + `assets/detailed/all`);
    }
    });
  }

  getUser(userId: number){
    return this.http.get<UserResultData>(this.baseUrl + 'users/' + userId);
  }

  saveUser(user: User) {
    return this.http.post<UserCreateResponse>(this.baseUrl + 'users/' + user.id + '/edit', user)
    .do(data => {
      if (data.success) {
        return data.user;
      }
    });
  }

  updateUserRoles(userId: number, list: Array<Number>){
    return this.http.post<UserRoleResponse>(this.baseUrl + 'users/' + userId + '/change_role', list)
    .do(data => {
      if (data.success) {
        return data.list;
      }
    });
  }

  sendInvite(invite: object){
    return this.http.post<UserInviteResponse>(this.baseUrl + 'users/invite', invite)
    .do(data => {
      if (data.success) {
        return data.message;
      }
    });
  }
}
