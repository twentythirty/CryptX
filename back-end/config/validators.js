require('./route_matchers');


RULE_NAMES = {
    STRING_NOT_BLANK: 'not_blank',
    STRING_IS_EMAIL: 'email',
    COL_NOT_EMPTY: 'not_empty',
    NUM_POS: 'num_pos',
    BOOL_PROP: 'bool_prop'
}


VALIDATORS = {
    [ROUTE_STRINGS.CreateUser]: {
        first_name: RULE_NAMES.STRING_NOT_BLANK,
        last_name: RULE_NAMES.STRING_NOT_BLANK,
        email: RULE_NAMES.STRING_IS_EMAIL,
        password: RULE_NAMES.STRING_NOT_BLANK
    },
    [ROUTE_STRINGS.InviteUser]: {
        first_name: RULE_NAMES.STRING_NOT_BLANK,
        last_name: RULE_NAMES.STRING_NOT_BLANK,
        email: RULE_NAMES.STRING_IS_EMAIL,
        role_id: RULE_NAMES.COL_NOT_EMPTY
    },
    [ROUTE_STRINGS.InvitationByToken]: {
        token: RULE_NAMES.STRING_NOT_BLANK
    },
    [ROUTE_STRINGS.CreateUserByInvite]: {
        invitation_id: RULE_NAMES.NUM_POS,
        password: RULE_NAMES.STRING_NOT_BLANK
    },
    [ROUTE_STRINGS.Login]: {
        username: RULE_NAMES.STRING_NOT_BLANK,
        password: RULE_NAMES.STRING_NOT_BLANK
    },
    [ROUTE_STRINGS.ChangeUserInfo]: {
        first_name: RULE_NAMES.STRING_NOT_BLANK,
        last_name: RULE_NAMES.STRING_NOT_BLANK,
        old_password: RULE_NAMES.STRING_NOT_BLANK,
        new_password: RULE_NAMES.STRING_NOT_BLANK,
        is_active: RULE_NAMES.BOOL_PROP
    },
    [ROUTE_STRINGS.ChangeUserRole]: {

    },
    [ROUTE_STRINGS.ChangePassword]: {
        old_password: RULE_NAMES.STRING_NOT_BLANK,
        new_password: RULE_NAMES.STRING_NOT_BLANK
    },
    [ROUTE_STRINGS.SendPasswordResetToken]: {
        email: RULE_NAMES.STRING_IS_EMAIL
    },
    [ROUTE_STRINGS.EditRole]: {

    },
    [ROUTE_STRINGS.CreateRole]: {
        name: RULE_NAMES.STRING_NOT_BLANK
    },
    [ROUTE_STRINGS.ChangeAssetStatus]: {
        comment: RULE_NAMES.STRING_NOT_BLANK,
        type: RULE_NAMES.NUM_POS
    },
    [ROUTE_STRINGS.CreateInvestment]: {
        strategy_type: RULE_NAMES.NUM_POS,
        is_simulated: RULE_NAMES.BOOL_PROP,
        deposit_usd: RULE_NAMES.NUM_POS
    },
    [ROUTE_STRINGS.ApproveRecipeRun]: {
        comment: RULE_NAMES.STRING_NOT_BLANK,
        status: RULE_NAMES.NUM_POS
    },
    [ROUTE_STRINGS.AlterOrdersGroup]: {
        comment: RULE_NAMES.STRING_NOT_BLANK,
        status: RULE_NAMES.NUM_POS
    },
    [ROUTE_STRINGS.CreateNewRecipeRun]: {

    },
    [ROUTE_STRINGS.CreateDeposit]: {
        asset_id: RULE_NAMES.NUM_POS,
        amount: RULE_NAMES.NUM_POS
    },
    [ROUTE_STRINGS.ChangeSettingValues]: {

    }
}