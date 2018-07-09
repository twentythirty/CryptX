import { EntitiesFilter } from './entitiesFilter';

enum Expression {
    'eq', 'ne', 'or', 'and', 'lt', 'lte', 'gt', 'gte', 'like', 'in'
}

export interface RolesAllRequestData extends EntitiesFilter {
    has_permissions?: string
}
