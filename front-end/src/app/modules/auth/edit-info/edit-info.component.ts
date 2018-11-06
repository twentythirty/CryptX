import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../shared/models/user';
import { finalize } from 'rxjs/operators';


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
  message: string = '';
  status: boolean = false;
  loading = false;

  userForm: FormGroup = new FormGroup({
    old_password: new FormControl('', [ Validators.required ]),
    new_password: new FormControl('', [ Validators.required ]),
    repeat_password: new FormControl('', [ Validators.required ]),
  });

  constructor(
    public authService: AuthService,
    public router: Router,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
  }

  updateInfo() {
    if (!this.passwordsMatch()) {
      this.message = 'New password was not repeated correctly';
      return;
    }

    this.loading = true;

    this.authService.changeInfo(this.userForm.value).pipe(
      finalize(() => this.loading = false)
    )
    .subscribe(response => {
      this.status = true;

      const snackBar = this.snackBar.open('✓ SUCCESS!', '', {
        panelClass: 'mat-snack-bar-success',
        verticalPosition: 'bottom',
        duration: 3000
      });

      this.router.navigate(['dashboard']);
    }, error => {
      if (error.error) {
        this.message = error.error.error;
      }
    });
  }

  passwordsMatch() {
    return this.userForm.controls.new_password.value === this.userForm.controls.repeat_password.value;
  }
}
