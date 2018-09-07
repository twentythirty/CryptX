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
    GetUsersColLOV: /\/users\/header_lov\/\w+$/,
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
    GetAssetDetailedInfo: /\/assets\/detailed\/\d+$/,
    GetAssetsDetailed: /\/assets\/detailed\/all$/,
    GetAssetsDetailedColLOV: /\/assets\/detailed\/header_lov\/\w+$/,
    ChangeAssetStatus: /\/assets\/\d+\/change_status$/,
    CreateInvestment: /\/investments\/create$/,
    GetInvestment: /\/investments\/\d+$/,
    GetInvestments: /\/investments\/all$/,
    GetInvestmentAmounts: /\/investments\/\d+\/deposit_amounts/,
    GetInvestmentsColLOV: /\/investments\/header_lov\/\w+/,
    GetInvestmentPortfolioStats: /\/investments\/portfolio_stats/,
    GetInvestmentStats: /\/investments\/timeline/,
    GetRecipeRun: /\/recipes\/\d+$/,
    GetRecipeRunsOf: /\/recipes\/of_investment\/\d+$/,
    GetRecipeRuns: /\/recipes\/all$/,
    GetRecipeRunsColLOV: /\/recipes\/header_lov\/\w+/,
    GetRecipeRunDetail: /\/recipe_details\/\d+$/,
    GetRecipeRunDetails: /\/recipe_details\/of_recipe\/\d+$/,
    GetRecipeRunDetailsColLOV: /\/recipe_details\/header_lov\/\w+/,
    ApproveRecipeRun: /\/recipes\/\d+\/approve$/,
    GetRecipeOrdersOfRecipe: /\/orders\/of_recipe\/\d+$/,
    GetRecipeOrdersOfGroup: /\/orders\/of_group\/\d+$/,
    GetRecipeOrders: /\/orders\/all$/,
    GetRecipeOrdersColLOV: /\/orders\/header_lov\/\w+/,
    GetRecipeOrder: /\/orders\/d+$/,
    GetRecipeOrdersGroup: /\/orders\/groups\/d+$/,
    getRecipeOrdersGroupOfRecipe: /\/orders\/groups\/of_recipe\/d+/,
    GenerateRecipeOrders: /\/recipes\/\d+\/generate_orders$/,
    AlterOrdersGroup: /\/orders\/d+\/alter$/,
    CreateNewRecipeRun: /\/investments\/\d+\/start_recipe_run$/,
    CreateDeposit: /\/investments\/\d+\/deposit$/,
    SubmitRecipeRunDeposit: /\/deposits\/\d+\/submit$/,
    ApproveRecipeRunDeposit: /\/deposits\/\d+\/approve$/,
    GetRecipeRunDepositsOf: /\/deposits\/of_recipe\/\d+$/,
    GetInvestmentRunDepositsOf: /\/deposits\/of_investment_run\/\d+$/,
    GetRecipeRunDeposits: /\/deposits\/all$/,
    GetRecipeRunDepositsColLOV: /\/deposits\/header_lov\/\w+/,
    GetRecipeRunDeposit: /\/deposits\/\d+$/,
    GetExecutionOrdersOfRecipeOrder: /\/execution_orders\/of_order\/\d+$/,
    GetExecutionOrdersOfInvestmentRun: /\/execution_orders\/of_investment_run\/\d+$/,
    GetExecutionOrders: /\/execution_orders\/all$/,
    ExecutionOrdersColLOV: /\/execution_orders\/header_lov\/\w+/,
    GetExecutionOrder: /\/execution_orders\/\d+$/,
    ChangeExecutionOrderStatus: /\/execution_orders\/\d+$\/change_status/,
    GetExecutionOrdersFillsOf: /\/exec_orders_fills\/of_order\/\d+$/,
    ExecutionOrdersFillColLOV: /\/exec_orders_fills\/header_lov\/\w+/,
    GetExecutionOrdersFills: /\/exec_orders_fills\/all$/,
    GetExecutionOrdersFill: /\/exec_orders_fills\/\d+$/,
    InstrumentCreate: /\/instruments\/create/,
    GetInstrument: /\/instruments\/\d+$/,
    GetInstruments: /\/instruments\/all$/,
    GetInstrumentsColLOV: /\/instruments\/header_lov\/\w+/,
    InstrumentCheckMapping: /\/instruments\/check_mapping$/,
    InstrumentMapExchanges: /\/instruments\/\d+\/add_mapping$/,
    InstrumentMappingExchanges: /\/instruments\/\d+\/mapping_exchanges/,
    GetInstrumentExchanges: /\/instruments\/\d+\/exchanges$/,
    GetExchangeInstrumentIDs: /\/exchanges\/\d+\/instruments$/,
    RemoveInstrumentExchangeMapping: /\/instruments\/\d+\/exchanges\/\d+\/delete$/,
    LiquidityReqCreate: /\/liquidity_requirements\/create$/,
    GetLiquidityRequirement: /\/liquidity_requirements\/\d+$/,
    GetLiquidityRequirements: /\/liquidity_requirements\/all$/,
    GetLiquidityRequirementsColLOV: /\/liquidity_requirements\/header_lov\/\w+/,
    GetLiquidityRequirementExchanges: /\/liquidity_requirements\/\d+\/exchanges$/,
    ChangeSettingValues: /\/settings\/\d+$/,
    ViewSettingValues: /\/settings$/,
    CheckAuth: /\/users\/login\/check$/,
    Logout: /\/users\/logout/,
    GetExchanges: /\/exchanges\/all$/,
    CreateExchangeAccount: /\/exchanges\/d+\/accounts\/create/,
    GetColdStorageTransfers: /\/cold_storage\/all$/,
    GetColdStorageTransfersColLOV: /\/cold_storage\/header_lov\/\w+$/,
    ApproveColdStorageTransfers: /\/cold_storage\/\d+\/approve$/,
    AddColdStorageCustodians: /\/cold_storage\/custodians\/add/,
    GetColdStorageCustodians: /\/cold_storage\/custodians\/all$/,
    GetColdStorageCustodiansColLOV: /\/cold_storage\/custodians\/header_lov\/\w+$/,
    AddColdstorageAccount: /\/cold_storage\/accounts\/add$/,
    GetColdstorageAccounts: /\/cold_storage\/accounts\/all$/,
    GetColdstorageAccountsColLOV: /\/cold_storage\/accounts\/header_lov\/\w+$/,
    GetColdstorageAccountsFees: /\/cold_storage\/accounts\/fees/,
    GetColdstorageAccountsFeesColLOV: /\/cold_storage\/accounts\/fees\/header_lov\/\w+$/
}

//same as above map but with regex strings that can be converted into regex objects
ROUTE_STRINGS = _.mapValues(ROUTE_MATCHERS, route_regex => {
    const regex_string = route_regex.toString();
    console.log(`Importing route: ${regex_string}`);
    const regex_string_length = regex_string.length;

    return regex_string.substring(1, regex_string_length - 1);
});