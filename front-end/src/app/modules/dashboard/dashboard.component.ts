import { NgModule, Component, OnInit } from '@angular/core';
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { InvestmentService } from '../../services/investment/investment.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public investments$: Observable<any>;

  constructor(
    private modelConstants: ModelConstantsService,
    private investmentService: InvestmentService,
    private router: Router
  ) {
    this.investments$ = this.investmentService.getAllInvestments().pipe(
      map(
        res => res.investment_runs
      )
    )
  }

  ngOnInit() {
  }

  addInvestmentRun(): void {
    this.investmentService.createInvestmentRun({
      // user_id,
      strategy_type: 101,
      is_simulated: false,
      deposit_usd: 150000
    }).subscribe(
      res => {
        this.router.navigate(['/run/investment/' + res.id])
      }
    )
  }

}

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,
    SharedModule
  ],
  providers: []
})
export class DashboardModule { }
