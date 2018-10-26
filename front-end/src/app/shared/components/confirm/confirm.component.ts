import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  confirmLoading: boolean = false;

  @Input() heading: string;

  @Output() onReject = new EventEmitter<object>();
  @Output() onConfirm = new EventEmitter<object>();

  handleReject() {
    this.onReject.emit();
  }

  handleConfirm() {
    this.confirmLoading = true;
    this.onConfirm.emit();
  }

}
