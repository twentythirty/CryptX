import { Injectable } from '@angular/core';

@Injectable()
export class ModelConstantsService {
  model_constants: Object;

  constructor() { }

  setConstants(values: Object) {
    this.model_constants = values;
  }

  /** Gets whole model_constants object */
  getConstants() {
    return this.model_constants;
  }

  /** Get name of constant through its value.
   * @param value constan number that will be used to find name by
   */
  getName(value: any) {
    const constants = this.getConstants();

    for (const group_key in constants) {
      const group = constants[group_key];
      if (Object.values(group).find(val => val === value)) {
        return Object.keys(group).find(key => group[key] === value );
      }
    }
  }

  /** Returns names of values in group
   * @param group_name name of group to get names of values from
   */
  getNames(group_name: string) {
    const group = this.getGroup(group_name);
    return Object.keys(group);
  }

  /** Get all groups defined in this file
   * @param group_name name of group
  */
  getGroup(group_name: string) {
    return this.getConstants()[group_name];
  }

  /* Add other ways to use model constants data if needed */
}
