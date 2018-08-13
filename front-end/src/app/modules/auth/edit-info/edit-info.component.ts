import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../shared/models/user';
import { FormGroup, FormControl, Validator } from "@angular/forms";
import { Router } from "@angular/router";

import { MatSnackBar } from '@angular/material';

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
              private router: Router,
              public snackBar: MatSnackBar) { }

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
   if (this.userForm.valid){
    if (!this.passwordsMatch()) {
      this.message = "New password was not repeated correctly";
      return false;
    }
    this.authService.changeInfo(this.user_info).subscribe(response => {
      this.status = true;
      
      let snackBar = this.snackBar.open('✓ SUCCESS!', '', {
        panelClass: 'mat-snack-bar-success',
        verticalPosition: 'bottom',
        duration: 3000
      });

      this.router.navigate(['dashboard']);
    }, error => {
      if(error.error) {
        this.message = error.error.error;
      }
    })
    }else {
      this.markAsTouched(this.userForm)
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map((field) => {
      const control = group.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

  passwordsMatch () {
    return this.user_info.new_password === this.user_info.repeat_password;
  }
}
