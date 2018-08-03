import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { StatusClass } from '../../../shared/models/common';

export class TimelineEvent {
  /**
   * Timeline Event display structure
   *
   * @param id
   * @param status - Event card subtitle
   * @param strategy_type - Event card description line #1
   * @param timestamp - Event card description line #2
   * @param count
   */
  public note?: string;

  constructor(
    public id?: string,
    public title?: string,
    public status?: string,
    public strategy_type?: string,
    public timestamp?: string,
    public count?: number,
    public isCurrent?: boolean
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
    private router: Router
  ) {
    console.log('status enum', Object.keys(StatusClass));
  }

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
      case 'execution_orders': routePart = 'run/execution-order'; break;
    }
    return this.router.isActive(routePart, false);
  }

  public openEvent(key: string, event: TimelineEvent): void {
    if(event) {
      switch(key) {
        case 'investment_run':   this.router.navigate([`/run/investment/${event.id}`]); break;
        case 'recipe_run':       this.router.navigate([`/run/recipe/${event.id}`]); break;
        case 'recipe_deposits':  this.router.navigate([`/run/deposit/${event.id}`]); break;
        case 'recipe_orders':    this.router.navigate([`/run/order/${event.id}`]); break;
        case 'execution_orders': this.router.navigate([`/run/execution_order/${event.id}`]); break;
      }
    }
  }

}
