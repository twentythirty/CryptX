import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  checkPerm (perm_code) {
    return this.authService.hasPermission(perm_code);
  }
}
