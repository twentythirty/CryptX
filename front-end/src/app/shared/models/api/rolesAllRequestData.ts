import { EntitiesFilter } from './entitiesFilter';

export interface RolesAllRequestData extends EntitiesFilter {
    has_permissions?: string
}
