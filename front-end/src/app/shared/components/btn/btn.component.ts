import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-btn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss']
})
export class BtnComponent implements OnInit {
  @Input() type: string = 'button';
  @Input() disabled: boolean;
  @Input() extraClass: string;
  @Input() thinner: boolean;
  @Input() grey: boolean;
  @Input() loading: boolean = false; // loading state with spinner

  @Output() onClick = new EventEmitter<void>();

  ngOnInit() {}

  emitClick() {
    this.onClick.emit();
  }
}
