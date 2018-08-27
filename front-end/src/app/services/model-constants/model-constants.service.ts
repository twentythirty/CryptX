import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable()
export class ModelConstantsService {
  model_constants: Object;

  constructor() { }

  setConstants(values: Object) {
    this.model_constants = values;
  }

  /** Gets whole model_constants object */
  getConstants(values: Object) {
    return this.model_constants
  }

  /** Get name of constant through its value.
   * @param value constan number that will be used to find name by
   */
  getName(value: any) {
    for(let group_key in this.model_constants) {
      let group = this.model_constants[group_key];
      if (Object.values(group).find(val => val === value)) {
        return Object.keys(group).find(key => group[key] == value );
      }
    }
  }

  /** Returns names of values in group
   * @param group_name name of group to get names of values from
   */
  getNames(group_name: string) {
    let group = this.model_constants[group_name];
    return Object.keys(group);
  }

  /** Get all groups defined in this file
   * @param group_name name of group
  */
  getGroup(group_name: string) {
    return this.model_constants[group_name];
  }

  /* Add other ways to use model constants data if needed */
}
