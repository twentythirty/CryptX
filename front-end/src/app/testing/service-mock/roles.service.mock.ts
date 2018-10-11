import { RolesAllResponse } from '../../services/roles/roles.service';
import { Role } from '../../shared/models/role';

export const getAllRolesData: RolesAllResponse = {
    success: true,
    roles: [
        new Role ({
            id: 1,
            name: 'ROLE_ADMIN',
            permissions: ['perm_alter_user_roles', 'perm_alter_role_perm'],
        })
    ],
    count: 1,
    footer: []
};
