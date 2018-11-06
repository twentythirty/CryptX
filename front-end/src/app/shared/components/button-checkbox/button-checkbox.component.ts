import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-checkbox',
  templateUrl: './button-checkbox.component.html',
  styleUrls: ['./button-checkbox.component.scss']
})
export class ButtonCheckboxComponent implements OnInit {
  id: String;

  @Input() value: string; // checkbox value
  @Input() labelTrue: string; // checkbox label text when checkbox is checked
  @Input() labelFalse: string; // checkbox label text when checkbox is unchecked
  @Input() checked: boolean; // is checkbox checked

  @Output() onToggle: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.id = 'id' + Math.random() * Math.pow(10, 16);
  }

  ngOnInit() {
  }

  handleToggle() {
    this.checked = !this.checked;

    this.onToggle.emit({
      value: this.value,
      checked: this.checked
    });
  }

}
