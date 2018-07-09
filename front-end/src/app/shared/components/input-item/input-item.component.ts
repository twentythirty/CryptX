import { Component, forwardRef, Input } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor, 
  NG_VALIDATORS, 
  FormControl, 
  Validator
} from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputItemComponent),
  multi: true
};

export const CUSTOM_INPUT_CONTROL_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => InputItemComponent),
  multi: true
};

@Component({
    selector: 'app-input-item',
    templateUrl: './input-item.component.html',
    styleUrls: ['./input-item.component.scss'],
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR, CUSTOM_INPUT_CONTROL_VALIDATORS]
})
export class InputItemComponent implements ControlValueAccessor, Validator {
  @Input() select: boolean; // True if this will be select field
  @Input() items: Array<string>; // select field items array

  //The internal data model
  private innerValue: any = '';
  private parseError: boolean;

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
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  // returns null when valid else the validation object 
  // in this case we're checking if the json parsing has 
  // passed or failed from the onChange method
  public validate(c: FormControl) {
    return (!this.parseError) ? null : {
      jsonParseError: {
        valid: false,
      },
    };
  }

  // change events from the textarea
  private onChange(event) {
    // get value from text area
    let newValue = event.target.value;
    // try {
    //   // parse it to json
    //   this.data = JSON.parse(newValue);
    //   this.parseError = false;
    // } catch (ex) {
    //   // set parse error if it fails
    //   this.parseError = true;
    // }
  }
}
