import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {

  constructor(private authService:AuthService, private router:Router) { }
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedPermissions = route.data.requiredPermission;
    
    if (!this.authService.hasPermissions(expectedPermissions)) {
      return false;
    }
    return true;
  }
}