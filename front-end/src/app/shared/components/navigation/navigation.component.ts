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
  initials: String;

  @Input() label: string;
  @Input() value: string;

  items = [{
    id: 10,
    text: 'text'
  },
  {
    id: 2,
    text: 'text2'
  }];
  selectedItem;
  public nav = [
    {link: '/dashboard', permission: ['VIEW_INVESTMENT_RUN'], name: 'Dashboard', show: false },
    {name: 'Crypto Asset Management', show: false, items: [
      {link: '/instruments', permission: ['VIEW_ROLES'], name: 'Instruments'},
      {link: '/assets', permission: ['VIEW_ASSETS'], name: 'Assets'},
      {link: '/liquidity_requirements', permission: ['VIEW_ROLES'], name: 'Liquidity requirements'},
    ]},
    {name: 'Investment', show: false, items: [
      {link: '/recipe_runs', permission: ['ALTER_PERMS'], name: 'Recipe Runs'},
      {link: '/orders', permission: ['ALTER_PERMS'], name: 'Orders'},
      {link: '/deposits', permission: ['ALTER_PERMS'], name: 'Deposits'},
      {link: '/execution_orders', permission: ['ALTER_PERMS'], name: 'Execution Orders'},
    ]},
    {name: 'User management', show: false, items: [
      {link: '/users', permission: ['EDIT_USERS'], name: 'Users'},
      {link: '/roles', permission: ['VIEW_ROLES'], name: 'Roles'},
    ]},
    {name: 'Cold Storage', show: false, items: [
      {link: '/login', permission: ['VIEW_INVESTMENT_RUN'], name: 'Custodians'},
      {link: '/login', permission: ['VIEW_INVESTMENT_RUN'], name: 'Accounts'},
      {link: '/cold_storage/transfers', permission: ['VIEW_INVESTMENT_RUN'], name: 'Transfer'},
      {link: '/login', permission: ['VIEW_INVESTMENT_RUN'], name: 'Fees'},
    ]}
  ];

  constructor(private authService: AuthService, private router: Router) {}

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

  toggleDropDownMenu (item) {
    item.show = !item.show;
  }

  hideAll (){
    this.nav.forEach(item => {
      item.show = false;
    });
  }
}
