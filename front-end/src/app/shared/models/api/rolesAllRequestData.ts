enum Expression {
    'eq', 'ne', 'or', 'and', 'lt', 'gte'
}

export interface RolesAllRequestData {
    filter?: {
        or?: [{
            field: String
            value: any
            expression: Expression
        }]
        and?: [{
            field: String
            value: any
            expression: Expression
        }]
        not?: [{
            field: String
            value: any
            expression: Expression
        }]
        prop_name_X?: any
        prop_name_1?: {
            value: String
            expression: Expression
        }
        prop_name_2?: {
            value: Array<String>
            expression: Expression
        }
    }
    limit: number
    offset: number
    order?: Array<{
        by: string
        order: 'asc' | 'desc'
    }>
    has_permissions?: string
}