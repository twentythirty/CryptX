import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() heading: string;
  @Input() errorIcon: boolean;

  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor() { }

  closeModal() {
    this.close.emit(null);
  }

  stopPropagation(e) {
    e.stopPropagation();
  }
}
