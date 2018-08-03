import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  showUserMenu: boolean = false;
  showUserRoles: boolean = false;
  initials: String;

  @Input() label: string;
  @Input() value: string;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.initials= (this.authService.user.first_name.charAt(0) + this.authService.user.last_name.charAt(0)).toUpperCase();
  }

  checkPerm (perm_code) {
    return this.authService.hasPermissions(perm_code);
  }

  logout () {
    this.authService.logOut().subscribe(res =>{
      if (res.success){
        this.authService.deauthorize();
        this.router.navigate(['login']);
      }
    });
  }

  toggleUserMenu () {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleUserRoles () {
    this.showUserRoles = !this.showUserRoles;
  }

}
