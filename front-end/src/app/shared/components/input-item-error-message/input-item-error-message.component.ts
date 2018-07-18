import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-input-item-error-message',
  templateUrl: './input-item-error-message.component.html',
  styleUrls: ['./input-item-error-message.component.scss']
})
export class InputItemErrorMessageComponent implements OnInit {
  @Input() errors: object;

  errorMessages = {
    required: () => `Field is required`,
    maxLength: ({ requiredLength }) => `Field require minimum length of ${requiredLength}`,
    minlength: ({ requiredLength }) => `Field require at least ${requiredLength} characters`,
    email: () => `Invalid email address`,
  };

  constructor() { }

  ngOnInit() {
  }

  getErrorMessage(): string {
    for(const error in this.errors) {
      //console.log(this.errorMessages[error]( this.errors[error] ))
      return this.errorMessages[error]( this.errors[error] );

    }
  }

}
