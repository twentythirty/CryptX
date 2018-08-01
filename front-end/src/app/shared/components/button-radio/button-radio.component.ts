import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-radio',
  templateUrl: './button-radio.component.html',
  styleUrls: ['./button-radio.component.scss']
})
export class ButtonRadioComponent implements OnInit {
  @Input() name: string;
  @Input() value: string;
  @Input() label: string;

  @Output() onChange = new EventEmitter<object>();

  constructor() { }

  ngOnInit() {
  }

  handleChange() {
    this.onChange.emit();
  }

}
