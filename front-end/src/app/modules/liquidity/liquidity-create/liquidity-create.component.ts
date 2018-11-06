import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { finalize, filter } from 'rxjs/operators';

import { LiquidityService } from '../../../services/liquidity/liquidity.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';

@Component({
  selector: 'app-liquidity-create',
  templateUrl: './liquidity-create.component.html',
  styleUrls: ['./liquidity-create.component.scss']
})
export class LiquidityCreateComponent implements OnInit {
  liquidityId: number;
  instruments: Array<{ id: number, value: string }>;
  exchanges: Array<{ id: number, value: string }>;

  loading = false;
  instrumentsLoading = true;
  exchangesLoading = true;

  form: FormGroup = new FormGroup({
    instrument_id: new FormControl('', Validators.required),
    exchange_id: new FormControl('', Validators.required),
    periodicity: new FormControl('', [
      Validators.required,
      Validators.min(1)
    ]),
    minimum_circulation: new FormControl('', [
      Validators.required,
      Validators.min(0)
    ]),
  });

  constructor(
    private liquidityService: LiquidityService,
    private instrumentService: InstrumentsService,
    private exchangesService: ExchangesService,
    private router: Router,
    private route: ActivatedRoute,
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

    const getMVPExchanges = true;
    this.exchangesService.getAllExchanges(getMVPExchanges).subscribe(res => {
      this.exchangesLoading = false;
      this.exchanges = res.exchanges.map(exchange => {
        return {
          id: exchange.id,
          value: exchange.name,
        };
      });

      this.translate.get('exchanges.all_exchanges').subscribe(value => {
        this.exchanges.push({
          /*set id value as number 0 instead of 'null'
          to make selector input understand that option is selected */
          id: 0,
          value: value
        });
      });
    });

    this.route.params.pipe(
      filter(params => params.id)
    ).subscribe(params => {
      this.liquidityId = params.id;

      // disable instrument select
      this.form.controls.instrument_id.disable();

      this.liquidityService.getLiquidity(this.liquidityId)
      .subscribe(
        res => {
          const record = res.liquidity_requirement;
          const exchange_id = record.exchange_id === null ? 0 : record.exchange_id;

          this.form.controls.instrument_id.setValue(record.instrument_id);
          this.form.controls.exchange_id.setValue(exchange_id);
          this.form.controls.periodicity.setValue(record.periodicity);
          this.form.controls.minimum_circulation.setValue(record.minimum_circulation);
        }
      );
    });
  }


  saveLiquidityRequirement() {
    if (this.form.invalid) {
      return false;
    }

    const request = _.mapValues(this.form.value, val => {
      /*in case of 'All Exchanges' selection, return id value back to
      expression: 'null'*/
      return val === 0 ? val = null : typeof val === 'object' ? val.id : _.toNumber(val);
    });

    this.loading = true;

    let endpoint;
    if (this.liquidityId) {
      endpoint = this.liquidityService.updateLiquidity(this.liquidityId, request);
    } else {
      endpoint = this.liquidityService.createLiquidityRequirement(request);
    }

    endpoint.pipe(
      finalize(() => this.loading = false)
    ).subscribe(
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
