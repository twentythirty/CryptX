import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-custodians-add',
  templateUrl: './custodians-add.component.html',
  styleUrls: ['./custodians-add.component.scss']
})
export class CustodiansAddComponent implements OnInit {

  form: FormGroup = new FormGroup({
    custodian_name: new FormControl('', Validators.required)
  });

  loading: boolean = false;
  
  constructor(private router: Router,
              private coldStorageService: ColdStorageService) { }

  ngOnInit() {
  }

  add(){
    const request = {
      name: this.form.get('custodian_name').value
    }

    this.loading=true;

    this.coldStorageService.addCustodian(request).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/cold_storage/custodians']);
        } else {
          console.log(data.error);
        }
      }
    );
  }

}
