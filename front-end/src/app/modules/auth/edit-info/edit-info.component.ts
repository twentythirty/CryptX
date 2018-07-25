import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../shared/models/user';
import { FormGroup, FormControl, Validator } from "@angular/forms";
import { Router } from "@angular/router";

class EditInfo extends User {
  old_password: string;
  new_password: string;
  repeat_password: string;
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

  userForm: FormGroup = new FormGroup ({
    OldPassword: new FormControl('', [this.authService.getValidators('\\/users\\/invite','first_name')]),
    NewPassword: new FormControl('', [this.authService.getValidators('\\/users\\/invite','last_name')]),
    RepeatPassword: new FormControl('', [this.authService.getValidators('\\/users\\/invite','last_name')]),
  });

  constructor(private authService: AuthService,
              private router: Router) { }

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
    if (!this.passwordsMatch()) {
      this.message = "Passwords doesn't match";
      return false;
    }
    this.authService.changeInfo(this.user_info).subscribe(response => {
      this.status = true;
      this.router.navigate(['dashboard']);
    }, error => {
      if(error.error) {
        this.message = error.error.error;
      }
    })
  }

  passwordsMatch () {
    return this.user_info.new_password === this.user_info.repeat_password;
  }
}
