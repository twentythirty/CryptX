import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { StatusClass } from '../../models/common';
import { permissions } from '../../../config/permissions';

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

export class TimelineEvents {
  investment_run: TimelineEvent;
  recipe_run: TimelineEvent;
  recipe_deposits: TimelineEvent;
  recipe_orders: TimelineEvent;
  execution_orders: TimelineEvent;
  cold_storage_transfers: TimelineEvent;
}


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @Input() timelineEvents: TimelineEvents;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {}


  public isActive(key: keyof TimelineEvents): boolean {
    let routeParts: Array<string>;

    switch (key) {
      case 'investment_run':          routeParts = ['run/investment']; break;
      case 'recipe_run':              routeParts = ['run/recipe']; break;
      case 'recipe_deposits':         routeParts = ['run/deposit']; break;
      case 'recipe_orders':           routeParts = ['run/order', 'run/order-group']; break;
      case 'execution_orders':        routeParts = ['run/execution-orders']; break;
      case 'cold_storage_transfers':  routeParts = ['run/cold-storage-transfers']; break;
    }

    return routeParts.some(part => this.router.isActive(part, false));
  }

  public isDisabled(key: keyof TimelineEvents) {
    const events = this.timelineEvents;

    switch (key) {
      case 'investment_run':
        return !events.investment_run;

      case 'recipe_run':
        return !events.recipe_run;

      case 'recipe_deposits':
        return !events.recipe_run || events.recipe_run.approval_status !== 'recipes.status.43';

      case 'recipe_orders':
        if (!events.recipe_deposits) {
          return true;
        }
        if (this.authService.hasPermissions([permissions.VIEW_ORDERS])) {
          return false; // can view even empty page
        }
        return events.recipe_deposits.status === 'deposits.status.150';

      case 'execution_orders':
        return !events.recipe_orders;

      case 'cold_storage_transfers':
        return !events.execution_orders;
    }
  }

  public openStep(key: keyof TimelineEvents): void {
    const events = this.timelineEvents;

    switch (key) {
      case 'investment_run':
        this.router.navigate([`/run/investment/${events.investment_run.id}`]);
        break;

      case 'recipe_run':
        this.router.navigate([`/run/recipe/${events.recipe_run.id}`]);
        break;

      case 'recipe_deposits':
        this.router.navigate([`/run/deposit/${events.recipe_run.id}`]);
        break;

      case 'recipe_orders':
        if (this.authService.hasPermissions([permissions.VIEW_ORDERS])) {
          this.router.navigate([`/run/order-group/${events.recipe_run.id}`]);
        } else {
          this.router.navigate([`/run/order/${events.recipe_run.id}`]);
        }
        break;

      case 'execution_orders':
        this.router.navigate([`/run/execution-orders/${events.investment_run.id}`]);
        break;

      case 'cold_storage_transfers':
        this.router.navigate([`/run/cold-storage-transfers/${events.recipe_run.id}`]);
        break;
    }
  }

}
