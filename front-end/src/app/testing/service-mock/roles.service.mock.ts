import { RolesAllResponse, RolesCreateResponse } from '../../services/roles/roles.service';
import { Role } from '../../shared/models/role';
import { RolesPermissionsResultData } from '../../shared/models/api/rolesPermissionsResultData';
import { RoleResultData } from '../../shared/models/api/roleResultData';

export const getAllRolesData: RolesAllResponse = {
  success: true,
  roles: [
    new Role({
      id: 1,
      name: 'ROLE_ADMIN',
      permissions: ['perm_alter_user_roles', 'perm_alter_role_perm'],
    })
  ],
  count: 1,
  footer: []
};

export const createRoleData: RolesCreateResponse = {
  success: true,
  role: new Role({
    id: 5,
    name: 'newRole',
    permissions: []
  })
};

export const getPermissionsListData: RolesPermissionsResultData = {
  success: true,
  data: [
    {
      id: 1,
      name: 'Investment run',
      permissions: [
        {
          id: 11,
          code: 'perm_create_investment_run',
          name: 'Permission to create investment runs'
        },
        {
          id: 10,
          code: 'perm_view_investment_run',
          name: 'Permission to view investment runs'
        }
      ]
    }
  ],
  total: 1
};

export const getRoleData: RoleResultData = {
  success: true,
  role: new Role({
    id: 1,
    name: 'newRole',
    permissions: ['perm_create_investment_run']
  })
};

export const roleDeleteData = {
  message: 'Role successfully deleted',
  success: true
};
