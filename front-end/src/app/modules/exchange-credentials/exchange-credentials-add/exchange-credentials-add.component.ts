import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { ExchangesService, CredentialField } from '../../../services/exchanges/exchanges.service';
import { forkJoin } from 'rxjs';


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
  fields: CredentialField[];
  fieldsWithoutApiKey: CredentialField[];
  showDeleteConfirm: boolean = false;

  form: FormGroup = new FormGroup({
    exchange: new FormControl('', Validators.required)
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exchangeServise: ExchangesService,
  ) { }

  ngOnInit() {
    this.form.controls.exchange.disable();

    this.exchangeServise.getAllExchanges().pipe(
      finalize(() => this.exchangesLoading = false)
    ).subscribe(
      res => {
        if (res.exchanges) {
          this.exchanges = res.exchanges;

          if (!this.isEdit) {
            this.form.controls.exchange.enable();
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

      forkJoin(
        this.exchangeServise.getCredentialFields(this.exchangeId),
        this.exchangeServise.getExchangeCredentials(this.exchangeId),
      )
      .subscribe(
        results => {
          const [ fieldsRes, credentialsRes ] = results;

          this.applyFields(fieldsRes.fields);

          this.form.controls.api_key.setValue(credentialsRes.exchange_credential.api_key);
        }
      );
    });
  }


  addCredentional() {
    if (this.form.invalid) {
      return;
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

  loadFields(): void {
    const exchangeId = this.form.controls.exchange.value;

    this.fieldsWithoutApiKey = null;
    _.forEach(this.form.controls, (control, key) => {
      if (key !== 'exchange') {
        this.form.removeControl(key);
      }
    });

    this.exchangeServise.getCredentialFields(exchangeId).subscribe(
      res => {
        this.applyFields(res.fields);
      }
    );
  }

  applyFields(fields: CredentialField[]): void {
    if (fields) {
      fields.forEach(field => this.form.addControl(field.field_name, new FormControl('', Validators.required)));
      this.fieldsWithoutApiKey = _.filter(fields, field => field.field_name !== 'api_key');
    }
  }


  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
  }

}
