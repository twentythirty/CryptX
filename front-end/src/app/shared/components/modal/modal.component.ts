import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor() { }

  closeModal (e) {
    this.close.emit(null);
  }

  ignore(e) {
    e.stopPropagation();
  }
}
