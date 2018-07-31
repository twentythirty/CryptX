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
    investment: TimelineEvent,
    recipe_run: TimelineEvent,
    deposits: TimelineEvent,
    orders: TimelineEvent,
    execution_orders: TimelineEvent
  }

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  public keys(obj: any): Array<string> {
    if(obj) {
      return Object.keys(obj);
    } else {
      return [];
    }
  }

  public openEvent(key: string, event: TimelineEvent): void {
    if(event.id || event.count) {
      switch(key) {
        case 'investment': this.router.navigate([`/run/investment/${event.id}`]); break;
        case 'recipe_run': this.router.navigate([`/run/recipe/${event.id}`]); break;
        case 'deposits': this.router.navigate([`/run/deposit/${event.id}`]); break;
        case 'orders': this.router.navigate([`/run/order/${event.id}`]); break;
        case 'execution_orders': this.router.navigate([`/run/execution_order/${event.id}`]); break;
      }
    }
  }

}
