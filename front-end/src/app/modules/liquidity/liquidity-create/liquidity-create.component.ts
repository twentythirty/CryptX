import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import _ from 'lodash';

import { AuthService } from '../../../services/auth/auth.service';
import { LiquidityService } from '../../../services/liquidity/liquidity.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';

import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-liquidity-create',
  templateUrl: './liquidity-create.component.html',
  styleUrls: ['./liquidity-create.component.scss']
})
export class LiquidityCreateComponent implements OnInit {
  instruments: Array<{ id: number, value: string }>;
  exchanges: Array<{ id: number, value: string }>;

  loading: boolean = false;

  form: FormGroup = new FormGroup({
    instrument_id: new FormControl('', _.compact([
      this.authService.getValidators('\\/liquidity_requirements\\/create', 'instrument_id')
    ])),
    exchange_id: new FormControl('', _.compact([
      this.authService.getValidators('\\/liquidity_requirements\\/create', 'exchange_id')
    ])),
    periodicity: new FormControl('', _.compact([
      this.authService.getValidators('\\/liquidity_requirements\\/create', 'periodicity')
    ])),
    minimum_circulation: new FormControl('', _.compact([
      this.authService.getValidators('\\/liquidity_requirements\\/create', 'minimum_circulation')
    ])),
  });

  constructor(
    private authService: AuthService,
    private liquidityService: LiquidityService,
    private instrumentService: InstrumentsService,
    private exchangesService: ExchangesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.instrumentService.getAllInstruments().subscribe(res => {
      this.instruments = res.instruments.map(instrument => {
        return {
          id: instrument.id,
          value: instrument.symbol,
        };
      });
    });

    this.exchangesService.getAllExchanges().subscribe(res => {
      this.exchanges = res.exchanges.map(exchange => {
        return {
          id: exchange.id,
          value: exchange.name,
        };
      });
    });
  }

  // reset form group control value if user dont pick anything from autocomplete
  assetValueChanged(value, controlName) {
    if (typeof value === 'string') {
      this.form.controls[ controlName ].setValue('');
    }
  }

  saveLiquidityRequirement() {
    const request = _.mapValues(this.form.value, val => {
      return typeof val === 'object' ? val.id : _.toNumber(val);
    });

    this.loading = true;

    this.liquidityService.createLiquidityRequirement(request).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/liquidity_requirements']);
        } else {
          console.log(data.error);
        }
      },
      error => {
        console.log(error);
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

}
