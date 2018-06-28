import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  @Input() label: string; // checkbox label text
  @Input() value: string; // checkbox value
  @Input() checked: boolean; // is checkbox checked

  @Output() onToggle: EventEmitter<any> = new EventEmitter();

  constructor() { }

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
