import { Component, OnInit, Input } from '@angular/core';
import { ActionLog } from '../../models/actionLog';

@Component({
  selector: 'app-action-log',
  templateUrl: './action-log.component.html',
  styleUrls: ['./action-log.component.scss']
})
export class ActionLogComponent implements OnInit {
  public showRationaleModal = false;
  public rationaleText;

  @Input() title: string;
  @Input() source: Array<ActionLog>;
  
  constructor() { }

  ngOnInit() {
  }

  public hideRationaleModal() {
    this.showRationaleModal = false;
  }

  public openRationaleModal(rationale: string) {
    this.showRationaleModal = true;
    this.rationaleText = rationale;
  }

}
