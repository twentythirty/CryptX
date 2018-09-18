import { Directive, Input, HostListener } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Directive({
  selector: '[appMarkAsTouched]'
})
export class MarkAsTouchedDirective {
  @Input() appMarkAsTouched: FormGroup;

  constructor() { }

  @HostListener('click', ['$event'])
  clickEvent(event) {
    this.markAsTouched(this.appMarkAsTouched);

    // prevent form submiting if form is invalid
    if (this.appMarkAsTouched.invalid) {
      return false;
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map((field) => {
      const control = group.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

}
