export class EntitiesFilter {
  /**
   * Entity filter. Scoped to a filter key to easily combine with other POST data.
   * @param filter
   * @param limit - How many rows to output
   * @param offset - How many rows to skip
   * @param order - Set order to return results in. Can sort by multiple properties.
   *                Property “by” specifies property/values to sort by, and “order” specifies
   *                in what order that property should be sorted (asc - ascending / desc - descending)
   */
  constructor(
    public limit: number = 10,
    public offset: number = 20,
    public filter?: EntitiesFilterRules,
    public order?: Array<{ by: string, order: string }>,
  ) {}
}

export class EntitiesFilterRules {
  /**
   * Rules for EntityFilter
   * @param or
   * @param and
   * @param not
   * @param prop_name_X
   * @param prop_name_1
   * @param prop_name_2
   */

  [key: string]: any

  constructor(
    or?: Array<FilterField>,
    and?: Array<FilterField>,
    not?: Array<FilterField>
  ) {}
}

export class FilterField {
  /**
   * Filter Field user in EntitiesFilterRules
   * @param field
   * @param value
   * @param expression
   * @param type
   */
  constructor(
    public field: string,
    public value: string,
    public expression: string,
    public type?: string
  ) {}
}
