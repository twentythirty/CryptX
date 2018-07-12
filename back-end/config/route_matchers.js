ROUTE_MATCHERS = {
    CreateUser: /\/users\/create$/,
    InviteUser: /\/users\/invite/,
    DeleteUserInfo: /\users\/rm\/(\d+|me)$/,
    InvitationByToken: /\/users\/invitation/,
    CreateUserByInvite: /\/users\/create-invited/,
    Login: /\/users\/login/,
    GetMyPermissions: /\/users\/me\/permissions/,
    GetUserInfo: /\/users\/(\d+|me)$/,
    GetUsersInfo: /\/users\/all\/list/,
    ChangeUserInfo: /\/users\/(\d+|me)\/edit/,
    ChangeUserRole: /\/users\/(\d+|me)\/change_role/,
    ChangePassword: /\/users\/(\d+|me)\/change_password/,
    SendPasswordResetToken: /\/send_reset_token/,
    ResetPassword: /\/password_reset\/\w+/,
    GetRoleInfo: /\/roles\/\d+$/,
    GetRolesInfo: /\/roles\/all/,
    EditRole: /\/roles\/\d+\/edit/,
    CreateRole: /\/roles\/create/,
    DeleteRole: /\/roles\/\d+\/delete/,
    GetAllPermissions: /\/permissions\/list/,
    GetAssetInfo: /\/assets\/\d+$/,
    GetAssets: /\/assets\/all$/,
    ChangeAssetStatus: /\/assets\/\d+\/change_status$/,
    CreateInvestment: /\/investments\/create$/,
    GetInvestment: /\/investments\/\d+$/,
    GetInvestments: /\/investments\/all$/,
    GetRecipeRun: /\/recipes\/\d+$/,
    GetRecipeRuns: /\/recipes\/all$/,
    GetRecipeRunDetails: /\/recipes\/\d+\/details$/,
    ApproveRecipeRun: /\/recipes\/\d+\/approve$/,
    GetRecipeOrders: /\/orders\/of_recipe\/d+$/,
    AlterOrdersGroup: /\/orders\/d+\/alter$/,
    CreateNewRecipeRun: /\/investments\/\d+\/create_recipe$/,
    CreateDeposit: /\/investments\/\d+\/deposit$/,
    ChangeSettingValues: /\/settings\/\d+$/,
    ViewSettingValues: /\/settings$/,
    CheckAuth: /\/users\/login\/check$/,
}

//same as above map but with regex strings that can be converted into regex objects
ROUTE_STRINGS = _.mapValues(ROUTE_MATCHERS, route_regex => {
    const regex_string = route_regex.toString();
    console.log(`Importing route: ${regex_string}`);
    const regex_string_length = regex_string.length;

    return regex_string.substring(1, regex_string_length - 1);
});