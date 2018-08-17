import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { LiquidityService } from '../../../services/liquidity/liquidity.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';

@Component({
  selector: 'app-liquidity-create',
  templateUrl: './liquidity-create.component.html',
  styleUrls: ['./liquidity-create.component.scss']
})
export class LiquidityCreateComponent implements OnInit {
  instruments: Array<{ id: number, value: string }>;
  exchanges: Array<{ id: number | '', value: string }>;

  loading: boolean = false;
  instrumentsLoading: boolean = true;
  exchangesLoading: boolean = true;

  form: FormGroup = new FormGroup({
    instrument_id: new FormControl('', Validators.required),
    exchange_id: new FormControl('', Validators.required),
    periodicity: new FormControl('', Validators.required),
    minimum_circulation: new FormControl('', Validators.required),
  });

  constructor(
    private liquidityService: LiquidityService,
    private instrumentService: InstrumentsService,
    private exchangesService: ExchangesService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.instrumentService.getAllInstruments().subscribe(res => {
      this.instrumentsLoading = false;
      this.instruments = res.instruments.map(instrument => {
        return {
          id: instrument.id,
          value: instrument.symbol,
        };
      });
    });

    this.exchangesService.getAllExchanges().subscribe(res => {
      this.exchangesLoading = false;
      this.exchanges = res.exchanges.map(exchange => {
        return {
          id: exchange.id,
          value: exchange.name,
        };
      });

      this.translate.get('exchanges.all_exchanges').subscribe(value => {
        this.exchanges.push({
          id: '',
          value: value
        });
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

    this.liquidityService.createLiquidityRequirement(request)
    .finally(() => this.loading = false)
    .subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/liquidity_requirements']);
        } else {
          console.log(data.error);
        }
      }
    );
  }

}
