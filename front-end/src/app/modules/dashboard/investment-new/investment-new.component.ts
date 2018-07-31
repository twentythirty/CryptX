import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-investment-new',
  templateUrl: './investment-new.component.html',
  styleUrls: ['./investment-new.component.scss']
})
export class InvestmentNewComponent implements OnInit {

  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onClose() {
    this.close.emit();
  }
}
