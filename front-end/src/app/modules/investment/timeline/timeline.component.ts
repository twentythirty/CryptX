import { Component, OnInit, Input } from '@angular/core';

export class TimelineEvent {
  constructor(
    public title: string,
    public status: string,
    public id: string,
    public date: string
  ) {}
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @Input() timelineEvents: Array<TimelineEvent>;

  constructor() { }

  ngOnInit() {
  }

}
