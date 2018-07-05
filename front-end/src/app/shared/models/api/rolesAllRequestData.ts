enum Expression {
    'eq', 'ne', 'or', 'and', 'lt', 'lte', 'gt', 'gte', 'like', 'in'
}

export interface RolesAllRequestData {
    filter?: {
        or?: Array<{
            field: string
            value: any
            expression: string
        }>
        and?: Array<{
            field: string
            value: any
            expression: string
        }>
        not?: Array<{
            field: string
            value: any
            expression: string
        }>
        [key: string]: any
    }
    limit: number
    offset: number
    order?: Array<{
        by: string
        order: 'asc' | 'desc'
    }>
    has_permissions?: string
}