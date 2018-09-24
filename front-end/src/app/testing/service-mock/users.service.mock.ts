import { User } from '../../shared/models/user';
import { UsersAllResponse, UserInviteResponse } from '../../services/users/users.service';

export const getAllUsersData: UsersAllResponse = {
    success: true,
    users: [
        new User({
            created_timestamp: '2018-08-16T06:58:18.838Z',
            email: 'shane@2030.io',
            first_name: 'Shane',
            id: 21,
            is_active: 'users.entity.active',
            last_name: 'Murphy',
            reset_password_token_hash: 'string',
            reset_password_token_expiry_timestamp: 'string',
            roles: [],
        })
    ],
    footer: [],
    count: 1
};

export const sendInviteResponseData: UserInviteResponse = {
    success: true,
    message: 'message'
};

