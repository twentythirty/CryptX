import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';
import { AuthService } from '../../../services/auth/auth.service';

export class TimelineEvent {
  public note?: string;

  constructor(
    public id?: number,
    public count?: number,
    public status?: string,
    public started_timestamp?: string,
    public completed_timestamp?: string,
    public updated_timestamp?: string,
    public created_timestamp?: string,
    public deposit_usd?: string,
    public is_simulated?: boolean,
    public strategy_type?: string,
    public user_created_id?: number,
    public order_group_id?: number,
    public approval_comment?: string,
    public approval_status?: string,
    public approval_timestamp?: string,
    public approval_user_id?: number,
    public investment_run_id?: number,
  ) {}
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @Input() timelineEvents: {
    investment_run: TimelineEvent,
    recipe_run: TimelineEvent,
    recipe_deposits: TimelineEvent,
    recipe_orders: TimelineEvent,
    execution_orders: TimelineEvent
  }

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {}

  public keys(obj: any): Array<string> {
    if(obj) {
      return Object.keys(obj);
    } else {
      return [];
    }
  }

  public isActive(key: string): boolean {
    let routePart;

    switch(key) {
      case 'investment_run':   routePart = 'run/investment'; break;
      case 'recipe_run':       routePart = 'run/recipe'; break;
      case 'recipe_deposits':  routePart = 'run/deposit'; break;
      case 'recipe_orders':    routePart = 'run/order'; break;
      case 'execution_orders': routePart = 'run/execution-orders'; break;
    }
    return this.router.isActive(routePart, false);
  }

  public openEvent(key: string, event: TimelineEvent): void {
    if(event) {
      switch(key) {
        case 'investment_run':   this.router.navigate([`/run/investment/${event.id}`]); break;
        case 'recipe_run':       this.router.navigate([`/run/recipe/${event.id}`]); break;
        case 'recipe_deposits':  this.router.navigate([`/run/deposit/${this.timelineEvents.recipe_run.id}`]); break;
        case 'recipe_orders':    
          if(this.authService.hasPermissions(['VIEW_ORDERS'])) {
            this.router.navigate([`/run/order-group/${event.order_group_id}`]);
          } else {
            this.router.navigate([`/run/order/${this.timelineEvents.recipe_run.id}`]);
          }
          break;
        case 'execution_orders': this.router.navigate([`/run/execution-orders/${this.timelineEvents.investment_run.id}`]); break;
      }
    }
  }

}
