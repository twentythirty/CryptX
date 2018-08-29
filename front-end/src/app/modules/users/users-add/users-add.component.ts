import { Component, OnInit } from '@angular/core';
import { RolesService } from "../../../services/roles/roles.service";
import { RolesAllRequestData } from "../../../shared/models/api/rolesAllRequestData";
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService } from "../../../services/users/users.service";
import { FormArray, FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../../services/auth/auth.service";

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss']
})
export class UsersAddComponent implements OnInit {

  constructor(private rolesService: RolesService,
              private usersService: UsersService,
              private router: Router,
              private authService: AuthService) { 
  }

  rolesRequestData: RolesAllRequestData = {
    limit: 20,
    offset: 0
  };

  rolelist = [];
  UserName = "" ;
  UserSurname = "";
  UserEmail: "";

  invite = {
    first_name: "String",
    last_name: "String",
    email: "String",
    role_id: []
  }

  loading = false;
  show = false;

  form: FormGroup;

  userForm: FormGroup = new FormGroup ({
    Name: new FormControl('', [this.authService.getValidators('\\/users\\/invite','first_name')]),
    Surname: new FormControl('', [this.authService.getValidators('\\/users\\/invite','last_name')]),
    Email: new FormControl('', [this.authService.getValidators('\\/users\\/invite','email')]),
  });

  ngOnInit() {
    this.rolesService.getAllRoles(this.rolesRequestData).subscribe(res => {
      this.rolelist = res.roles;
      this.add();
    });
    
  }

  saveUser(){
      if (this.form.valid && this.userForm.valid){
        this.invite.first_name = this.UserName;
        this.invite.last_name = this.UserSurname;
        this.invite.email = this.UserEmail;
        this.invite.role_id = this.form.controls.selectedItems.value;
        this.usersService.sendInvite(this.invite).subscribe(
        data => {
              if(data.success){
                this.loading=false;
                this.router.navigate(['/users']);
              }else{
                console.log(data.message)
                this.loading=true;
              }
            }, error => {
              console.log('Error', error);
            }, () => {
              this.loading = false;
            }); 
      } else {
        this.markAsTouched(this.userForm);
        this.show = true;
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

  add(){
    let checkboxGroup = new FormArray(this.rolelist.map(item => new FormGroup({
      id: new FormControl(item.id),
      text: new FormControl(item.name),
      checkbox: new FormControl(false)
    })));
    // create a hidden reuired formControl to keep status of checkbox group
    let hiddenControl = new FormControl(this.mapItems(checkboxGroup.value), this.authService.getValidators('\\/users\\/invite','role_id'));
    // update checkbox group's value to hidden formcontrol
    checkboxGroup.valueChanges.subscribe((v) => {
      hiddenControl.setValue(this.mapItems(v));
    });

    this.form = new FormGroup({
      items: checkboxGroup,
      selectedItems: hiddenControl
    });
  }

  mapItems(items) {
    let selectedItems = items.filter((item) => item.checkbox).map((item) => item.id);
    return selectedItems.length ? selectedItems : null;
  }

  click(){
    this.show = true;
  }
}