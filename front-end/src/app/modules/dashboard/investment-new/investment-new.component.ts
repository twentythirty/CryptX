import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import { ModelConstantsService } from "../../../services/model-constants/model-constants.service";
import { Observable } from 'rxjs/Observable'; 
import { InvestmentService } from "../../../services/investment/investment.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-investment-new',
  templateUrl: './investment-new.component.html',
  styleUrls: ['./investment-new.component.scss']
})
export class InvestmentNewComponent implements OnInit {

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() onComplete: EventEmitter<any> = new EventEmitter();

  mode= false;
  portfolio= false;
  next_step = false;

  group_name = 'STRATEGY_TYPES'
  strategies = {};
  amount: {
    strategy_type: number,
    is_simulated: boolean,
    deposit_usd: number,
    /*deposit_btc: number,
    deposit_eth: number*/
  }

  runForm: FormGroup = new FormGroup({
    deposit_usd: new FormControl('', [Validators.required]),
    /*deposit_btc: new FormControl('', [Validators.required]),
    deposit_eth: new FormControl('', [Validators.required])*/
  });

  constructor(private modelConstantService: ModelConstantsService,
              private investmentService: InvestmentService,
              private router: Router) { 
    this.amount ={
      strategy_type: null,
      is_simulated: null,
      deposit_usd: null,
      /*deposit_btc: null,
      deposit_eth: null*/
    }
  }

  ngOnInit() {
    this.strategies = Object.entries(this.modelConstantService.getGroup(this.group_name))
  }

  onChangeMode(value) {
    this.amount.is_simulated = value;
    this.mode = true;
    this.isValid();
  }

  onChangePortfolio(value){
    this.amount.strategy_type = value[1];
    this.portfolio = true;
    this.isValid();
  }

  isValid(){
    if(this.mode && this.portfolio){
      this.next_step = true;
    }
  }

  Confirm(){
    if (this.runForm.valid){
      this.investmentService.createInvestmentRun(this.amount).subscribe(
      (data) => {
        if (data.success) {
          this.onClose();
          this.onComplete.emit();
          this.router.navigate(['/run/investment', data.investment_run.id]);
        } 
      }, error => {
        console.log('Error', error);
      }, () => {
      });
    }else {
      this.markAsTouched(this.runForm);
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

  onClose() {
    this.close.emit();
  }
}
