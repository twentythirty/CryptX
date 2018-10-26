import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, filter } from 'rxjs/operators';

import { ExchangesService } from '../../../services/exchanges/exchanges.service';

@Component({
  selector: 'app-exchange-credentials-add',
  templateUrl: './exchange-credentials-add.component.html',
  styleUrls: ['./exchange-credentials-add.component.scss']
})
export class ExchangeCredentialsAddComponent implements OnInit {
  exchangeId: number;
  isEdit: boolean = false;
  showAllField: boolean = false;
  exchanges: any[];
  exchangesLoading: boolean = true;
  deleteLoading: boolean = false;
  loading: boolean = false;
  showDeleteConfirm: boolean = false;

  form: FormGroup = new FormGroup({
    exchange: new FormControl('', Validators.required),
    api_key: new FormControl('', Validators.required),
    api_secret: new FormControl('', Validators.required),
    admin_password: new FormControl('', Validators.required)
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exchangeServise: ExchangesService,
  ) { }

  ngOnInit() {
    this.form.disable();

    this.exchangeServise.getAllExchanges().pipe(
      finalize(() => this.exchangesLoading = false)
    ).subscribe(
      res => {
        if (res.exchanges) {
          this.exchanges = res.exchanges;

          if (!this.isEdit) {
            this.form.enable();
          } else {
            [
              'api_key',
              'api_secret',
              'admin_password'
            ].forEach(key => this.form.controls[key].enable());
          }
        }
      }
    );

    // subscribe ID param from url
    this.route.params.pipe(
      filter(params => params.id)
    ).subscribe(data => {
      this.exchangeId = +data.id;
      this.isEdit = true;

      this.form.controls.exchange.setValue(this.exchangeId);

      this.exchangeServise.getExchangeCredentials(data.id).subscribe(
        res => {
          this.form.controls.api_key.setValue(res.exchange_credential.api_key);
        }
      );
    });
  }


  addCredentional() {
    if (this.form.invalid) {
      return false;
    }

    this.loading = true;

    const exchangeId = this.form.controls.exchange.value;
    const request = Object.assign({}, this.form.value);
    delete request.exchange;

    this.exchangeServise.setExchangeCredentials(exchangeId, request).pipe(
      finalize(() => this.loading = false)
    )
    .subscribe(
      res => {
        if (res.success) {
          this.router.navigate(['/exchange_credentials']);
        }
      }
    );
  }

  deleteCredentional() {
    this.deleteLoading = true;

    this.exchangeServise.deleteExchangeCredentials(this.exchangeId).pipe(
      finalize(() => this.deleteLoading = false)
    ).subscribe(
      res => {
        if (res.success) {
          this.router.navigate(['/exchange_credentials']);
        }
      }
    );
  }


  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
  }

}
