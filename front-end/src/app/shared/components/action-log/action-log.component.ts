import { Component, OnInit, Input } from '@angular/core';
import { ActionLog } from '../../models/actionLog';

@Component({
  selector: 'app-action-log',
  templateUrl: './action-log.component.html',
  styleUrls: ['./action-log.component.scss']
})
export class ActionLogComponent implements OnInit {
  @Input() title: string;
  @Input() source: Array<ActionLog>;
  
  constructor() { }

  ngOnInit() {
  }

}
