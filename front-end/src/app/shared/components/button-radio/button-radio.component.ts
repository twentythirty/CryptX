import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button-radio',
  templateUrl: './button-radio.component.html',
  styleUrls: ['./button-radio.component.scss']
})
export class ButtonRadioComponent implements OnInit {
  @Input() name: string;
  @Input() value: string;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

  handleChange() {

  }

}
