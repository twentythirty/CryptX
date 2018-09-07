import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { InvestmentService } from '../../../services/investment/investment.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-investment-new',
  templateUrl: './investment-new.component.html',
  styleUrls: ['./investment-new.component.scss']
})
export class InvestmentNewComponent implements OnInit {

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() onComplete: EventEmitter<any> = new EventEmitter();

  mode = false;
  portfolio = false;
  next_step = false;
  loading = false;

  group_name = 'STRATEGY_TYPES';
  strategies = {};
  strategy_type; // Selected strategy type
  is_simulated; // Selected mode type

  runForm: FormGroup = new FormGroup({
    deposit_usd: new FormControl('', [Validators.required]),
    deposit_btc: new FormControl(''),
    deposit_eth: new FormControl('')
  });

  constructor(
    private modelConstantService: ModelConstantsService,
    private investmentService: InvestmentService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.strategies = Object.entries(this.modelConstantService.getGroup(this.group_name));
  }

  onChangeMode(value) {
    this.is_simulated = value;
    this.mode = true;
    this.isValid();
  }

  onChangePortfolio(value) {
    this.strategy_type = value[1];
    this.portfolio = true;
    this.isValid();
  }

  isValid() {
    if (this.mode && this.portfolio) {
      this.next_step = true;
    }
  }

  Confirm() {
    this.loading = true;

    const request = {
      strategy_type: this.strategy_type,
      is_simulated: this.is_simulated,
      deposit_amounts: this.toArray()
    };

    this.investmentService.createInvestmentRun(request).pipe(
        finalize(() => this.loading = false)
      ).subscribe(
        data => {
          if (data.success) {
            this.onClose();
            this.onComplete.emit();
            this.router.navigate(['/run/investment', data.investment_run.id]);
          }
        }, error => {
          console.log('Error', error);
        }, () => {
        }
    );
  }

  toArray() {
    const array = [];
    if (this.runForm.get('deposit_usd').value !== '') {
      const obj = {
        symbol: 'USD',
        amount: Number(this.runForm.get('deposit_usd').value)
      };
      array.push(obj);
    }
    if (this.runForm.get('deposit_btc').value !== '') {
      const obj = {
        symbol: 'BTC',
        amount: Number(this.runForm.get('deposit_btc').value)
      };
      array.push(obj);
    }
    if (this.runForm.get('deposit_eth').value !== '') {
      const obj = {
        symbol: 'ETH',
        amount: Number(this.runForm.get('deposit_eth').value)
      };
      array.push(obj);
    }
    return array;
  }

  onClose() {
    this.close.emit();
  }
}
