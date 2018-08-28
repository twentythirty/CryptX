import { Component, HostListener, ElementRef, OnInit, Input } from '@angular/core';
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
      {link: '/cold_storage/custodians', permission: ['VIEW_INVESTMENT_RUN'], name: 'Custodians'},
      {link: '/cold_storage/accounts', permission: ['VIEW_INVESTMENT_RUN'], name: 'Accounts'},
      {link: '/cold_storage/transfers', permission: ['VIEW_INVESTMENT_RUN'], name: 'Transfer'},
      {link: '/login', permission: ['VIEW_INVESTMENT_RUN'], name: 'Fees'},
    ]}
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private elementRef : ElementRef,
  ) {}

  ngOnInit() {
    this.initials = (this.authService.user.first_name.charAt(0) + this.authService.user.last_name.charAt(0)).toUpperCase();
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

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
        this.hideAllDropDownMenus();
        this.hideUserMenu();
    }
  }

  toggleUserMenu () {
    this.showUserMenu = !this.showUserMenu;

    this.hideAllDropDownMenus();
  }

  hideUserMenu() {
    this.showUserMenu = false;
  }

  toggleDropDownMenu (item) {
    this.nav.forEach(i => {
      if(i !== item) i.show = false;
    });

    this.hideUserMenu();

    item.show = !item.show;
  }

  hideAllDropDownMenus (){
    this.nav.forEach(item => {
      item.show = false;
    });
  }

  hideAll() {
    this.hideUserMenu();
    this.hideAllDropDownMenus();
  }
}
