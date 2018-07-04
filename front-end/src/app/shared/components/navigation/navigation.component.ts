import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  showUserMenu: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  checkPerm (perm_code) {
    return this.authService.hasPermissions(perm_code);
  }

  logout () {
    this.authService.deauthorize();
    this.router.navigate(['login']);
  }

  toggleUserMenu () {
    this.showUserMenu = !this.showUserMenu;
  }
}
