import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-radio',
  templateUrl: './button-radio.component.html',
  styleUrls: ['./button-radio.component.scss']
})
export class ButtonRadioComponent implements OnInit {
  id: String;

  @Input() name: string;
  @Input() value: string;
  @Input() label: string;

  @Output() onChange = new EventEmitter<object>();

  constructor() {
    this.id = 'id' + Math.random() * Math.pow(10, 16);
  }

  ngOnInit() {
  }

  handleChange() {
    this.onChange.emit();
  }

}
