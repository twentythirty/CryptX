import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-input-item-error-message',
  templateUrl: './input-item-error-message.component.html',
  styleUrls: ['./input-item-error-message.component.scss']
})
export class InputItemErrorMessageComponent implements OnInit {
  @Input() errors: object;
  @Input() errorMessage: string;

  errorMessages = {
    required: () => `Field is required`,
    maxLength: ({ requiredLength }) => `Field require minimum length of ${requiredLength}`,
    minLength: ({ requiredLength }) => `Field require at least ${requiredLength} characters`,
    min: ({ min }) => `The value must be equal or bigger than ${min}`,
    max: ({ max }) => `The value must be equal or smaller than ${max}`,
    email: () => `Invalid email address`,
  };

  constructor() {}

  ngOnInit() {
    console.log('errors', this.errors);
  }

  getErrorMessage(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    } else {
      for(const error in this.errors) {
        return this.errorMessages[error]( this.errors[error] );
      }
    }
  }

}
