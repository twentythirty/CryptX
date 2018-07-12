import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * This can later be mapped to certain CSS classes
 */
export enum StatusColor {
  DEFAULT =  '#000',
  REJECTED = '#88a4ae',
  PENDING = '#ff992f',
  SUCCESS = '#1f9f7f'
}

export class TimelineEvent {
  /**
   * Timeline Event display structure
   *
   * @param title - Event card titile
   * @param status - Event card subtitle
   * @param statusColor - Color of the subtitle
   * @param id - Event card description line #1
   * @param date - Event card description line #2
   * @param routerLink - Link to navigate when clicked (if clickable)
   * @param isCurrent - Apply current card-specific style
   */
  constructor(
    public title: string,
    public status: string,
    public statusColor: StatusColor = StatusColor.DEFAULT,
    public id: string,
    public date: string,
    public routerLink?: string,
    public isCurrent: boolean = false
  ) {}
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @Input() timelineEvents: Array<TimelineEvent>;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  public openEvent(event: TimelineEvent): void {
    if(event.routerLink) {
      this.router.navigate([event.routerLink]);
    }
  }

}
