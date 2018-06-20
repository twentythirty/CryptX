import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../shared/models/user';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    this.authService.checkAuth()/* .pipe(
      map((response) => {
        return response[0].user;
      })
    ); */.subscribe(response => {
      let user = Object.assign({}, response[0].user);
      this.user_info = user;
      console.log("User info", this.user_info);
      this.doneLoading = true;
    });
  }

  updateInfo () {
         
    this.authService.changeInfo(this.user_info).subscribe(response => {
      console.log(response);
      this.status = true;
    }, error => {
      this.message = error.error.error;
    })
  }
}
