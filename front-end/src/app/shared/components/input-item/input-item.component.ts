import { Component, forwardRef, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor, 
  FormGroup,
  AbstractControl
} from '@angular/forms';
//import { EventEmitter } from 'protractor';

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
  @Input() items: Array<{
    value: number | string
    name: string
  }>; // select field items array
  @Input() formGroup: FormGroup; // reactive forms form group instance
  @Input() formControlName: string; // reactive forms form group control name
  @Input() label: string; //input heading
  @Input() bindValue: string //input items object field to bind as a option value
  @Input() bindLabel: string //input items object field to bind as a option label
  @Input() placeholder: string;
  @Input() type: string;
  @Input() clearable: boolean; //ability to clear selection
  @Input() readonly: boolean; //makes input readonly
  @Input() spinnerLoading: boolean; //shows spinner while loading input selection data
  @Input() fieldType: string; //type of input (input/select/autocomplete)

  @Output() selectChange = new EventEmitter();
  @Output() openList = new EventEmitter();

  //The internal data model
  private innerValue: any = '';

  private fieldControl: AbstractControl;

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  //get accessor
  get value(): any {
    if(!this.innerValue) return null;
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
    if (this.formGroup) {
      this.fieldControl = this.formGroup.get( this.formControlName );
    }
  }

  isInvalid(): boolean {
    if (!this.fieldControl) {
      return true;
    }
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

  change(val){
    this.selectChange.emit(val);
  }

  listOpen(val){
    this.openList.emit(val);
  }
}
