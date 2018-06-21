import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../shared/models/user';

class EditInfo extends User {
  old_password: string;
  new_password: string;
}

@Component({
  selector: 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.scss']
})
export class EditInfoComponent implements OnInit {
  user_info: EditInfo;
  doneLoading: boolean = false;
  message: string = '';
  status: boolean = false;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.getMyInfo();
  }

  getMyInfo () {
    this.authService.checkAuth().subscribe(response => {
      let user = Object.assign({}, response[0].user);
      this.user_info = user;
      this.doneLoading = true;
    });
  }

  updateInfo () {
         
    this.authService.changeInfo(this.user_info).subscribe(response => {
      this.status = true;
    }, error => {
      this.message = error.error.error;
    })
  }
}
