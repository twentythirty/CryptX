import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor, 
  FormGroup,
  AbstractControl
} from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputItemComponent),
  multi: true
};

@Component({
    selector: 'app-input-item',
    templateUrl: './input-item.component.html',
    styleUrls: ['./input-item.component.scss'],
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class InputItemComponent implements ControlValueAccessor, OnInit {
  @Input() select: boolean; // True if this will be select field
  @Input() items: Array<string>; // select field items array
  @Input() formGroup: FormGroup; // reactive forms form group instance
  @Input() formControlName: string; // reactive forms form group control name
  @Input() label: string; //input heading
  @Input() placeholder: string;
  @Input() type: string;

  //The internal data model
  private innerValue: any = '';

  private fieldControl: AbstractControl;

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  //get accessor
  get value(): any {
    return this.innerValue;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  ngOnInit() {
    this.fieldControl = this.formGroup.get( this.formControlName );
  }

  isInvalid(): boolean {
    return this.fieldControl.invalid && (this.fieldControl.dirty || this.fieldControl.touched);
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: () => any) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: () => any) {
    this.onTouchedCallback = fn;
  }
}
