export const checkTokenData = {
  success: true,
  invitation: {
    id: 45,
    was_used: false,
    token: 'fake-token',
    token_expiry_timestamp: 1525424340810,
    email: 'test@domain.com',
    first_name: 'Test',
    last_name: 'User',
    role_id: 25,
    creator_id: 888
  }
};

export const fulfillInvitationData = {
  success: true,
  user: {
    id: 45,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@domain.com',
    created_timestamp: 1525424340810,
    reset_password_token_hash: '79054025255fb1a26e4bc422aef54eb4',
    reset_password_token_expiry_timestamp: 1525424340810,
    is_active: true
  }
};

