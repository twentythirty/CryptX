import { User } from '../../shared/models/user';
import { UsersAllResponse, UserInviteResponse } from '../../services/users/users.service';
import { UserResultData } from '../../shared/models/api/userResultData';

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
            reset_password_token_hash: null,
            reset_password_token_expiry_timestamp: null,
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

export const getUserData: UserResultData = {
    success: true,
    user: new User({
        created_timestamp: '2018-08-16T06:58:18.838Z',
        email: 'shane@2030.io',
        first_name: 'Shane',
        id: 21,
        is_active: 'users.entity.active',
        last_name: 'Murphy',
        reset_password_token_hash: null,
        reset_password_token_expiry_timestamp: null,
        roles: [1, 2],
    })
};

export const userEditResponse = {
    success: true,
    user: {}
};

export const userEditFailed = {
    success: false
};
