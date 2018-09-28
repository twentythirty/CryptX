import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-btn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss']
})
export class BtnComponent {
  @Input() type: string = 'button';
  @Input() disabled: boolean;
  @Input('thinner') thinner: boolean;
  @Input('grey') grey: boolean;

  @Output() onClick = new EventEmitter<void>();

  emitClick() {
    this.onClick.emit();
  }
}
