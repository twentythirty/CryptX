# CryptX DB schema

user # User of the CryptX system
-
id PK int
first_name nvarchar
last_name nvarchar
email nvarchar
password nvarchar # Hashed and salted password
created_timestamp timestamp
reset_password_token_hash nvarchar NULLABLE # Hash of email confirmation token that was sent to user's email
reset_password_token_expiry_timestamp timestamp NULLABLE # Timestamp when email confirmation token expires
is_active bool # True - user is active, False - user is disabled

user_session # User's session that is identified by an authentication token
-
id PK int
user_id int FK >- user.id # User to whom the session belongs
token varchar # Bearer token which gives user access to the session
expiry_timestamp timestamp # Time when session will expire
ip_address varchar # IP address which was used to start the session

permission # Table that contains all the permissions available in the system
-
id enum UNIQUE # Identifier of the permission that maps it to the source code of the system
code varchar # Permission code that is used to as identifying value
name varchar # User friendly name of the permission
category_id int FK >- permissions_category.id

permissions_category
-
id PK int
name varchar # Name of category
order_idx int # Category order index

role # Table that contains all the roles available in the system
-
id PK int
name varchar # User friendly name of the role

role_permission # Determines which permissions are available for users of a given role
-
role_id PK int FK >- role.id
permission_id PK enum FK >- permission.id

user_role # This table maps users to roles that are enabled for them
-
user_id int FK >- user.id
role_id int FK >- role.id

asset # Tradable asset (symbol)
-
id PK int
symbol nvarchar # Symbol, e.g. BTC
long_name nvarchar # User friendly name of the symbol, e.g. Bitcoin
is_base bool # True - if it is a base currency, False - if not
is_deposit bool # True - if it is a desposit currency

asset_blockchain # This mapping will exist for blockchain based instruments, e.g. Bitcoin
-
id PK int
asset_id int FK >- asset.id
coinmarketcap_identifier nvarchar # Identifier in coinmarketcap system

instrument # Tradable instrument
-
id PK int
transaction_asset_id int FK >- asset.id # Transaction asset in a traded pair, e.g. "EUR" in instrument "EURUSD"
quote_asset_id int FK >- asset.id # Quote asset in a traded pair, e.g. "USD" in instrument "EURUSD"
symbol string

instrument_liquidity_requirement # This table is used to define minimum liquidity requirements for exchanges
-
id PK int
instrument_id int FK >- instrument.id
minimum_volume decimal # Minimum volume
periodicity_in_days int
exchange int FK >- exchange.id

asset_status_change
-
id PK int
timestamp timestamp # Time and date when the change was made
asset_id FK >- asset.id
user_id int NULLABLE FK >- user.id # User who initiated this action. NULL if initated by the system
comment nvarchart # Comment that can be provided by the user initiating the status change
type enum # Type of change: Whitelisting, Blacklisting, Graylisting

exchange # This table contains exchanges will be used for investing
-
id PK int
name varchar
api_id varchar # Identification code for API

instrument_exchange_mapping # This table determines which instruments are available on which exchanges
-
instrument_id PK int FK >- instrument.id
exchange_id PK int FK >- exchange.id
external_instrument_id varchar
tick_size decimal # Determines minimum price change of the instrument on this exchange

exchange_account # This table defines accounts available on each exchange
-
id PK int
exchange_id int FK >- exchange.id # Exchange on which the account is based
asset_id int FK >- asset.id # Asset in which acount is denominated
account_type enum
external_identifier varchar # External identifier of the account, e.g. account's address

cold_storage_account # This table defines accounts available for cold storage of cryptocurrencies
-
id PK int
asset_id int FK >- asset.id
strategy_type enum # Strategy type for which this account is used. Possible values: Large Cap Index (LCI), Mid Cap Index (MCI)
address nvarchar # Address that can be used to send the coins to this cold storage account
cold_storage_custodian_id int FK >- cold_storage_custodian.id

cold_storage_custodian # This table defines available custodians
-
id PK int
name varchar # Custodian of the cold storage account

asset_market_capitalization # This table will contain market history retrieved from Coinmarketcap
-
int FK id
timestamp timestamp # Timestamp when the information was retrieved
asset_id FK int FK >- asset.id # Asset for which the infromation was retrieved
capitalization_usd decimal # Total market capitalization of the asset in USD
market_share_percentage decimal # Market cap of the asset as percentage of total capitalization of whole market

instrument_market_data
-
id FK int
timestamp timestamp
instrument_id int FK >- instrument.id
exchange_id int FK >- exchange.id
ask_price decimal
bid_price decimal

market_history_calculation
-
int FK id
timestamp timestamp # Timestamp when the information was calculated
asset_id FK int FK >- asset.id # Asset for which the infromation was retrieved
type enum # Type of the calculated property. Possible values: 0 - Network Value to Transactions ratio, measures the dollar value of cryptoasset transaction activity relative to network value
value decimal

investment_run # Investment workflow run
-
id PK int
started_timestamp timestamp # Time when the run was initiated
updated_timestamp timestamp # Last time when the run was updated
completed_timestamp timestamp NULLABLE # Timestamp when the run was completed, e.g. reached its terminal state
user_created_id int FK >- user.id # User which initiated the investment run
strategy_type enum # Large Cap Index (LCI), Mid Cap Index (MCI)
is_simulated bool # True if investment run is simulated, e.g. will not place real orders
status enum # Status of the investment run: Initiated, RecipeRun, RecipeApproved, DepositsCompleted, OrdersGenerated, OrdersApproved, OrdersExecuting, OrdersFilled
deposit_usd decimal # Total deposits invested during this investment run

recipe_run_deposit # Funds deposited for investing during single investment run
-
id PK int
creation_timestamp timestamp # Time when deposit was planned
recipe_run_id int FK >- recipe_run.id
asset_id int FK >- asset.id # Currency in which the investment was denominated
amount decimal # Amount deposited
fee decimal # Deposit management fees deducted
depositor_user_id int FK >- user.id # Depositor who made the deposit
completion_timestamp timestamp # Time when deposit was completed
target_exchange_account_id int FK >- exchange.id # Exchange account to which deposit will be made
status enum # Status of the deposit. Possible values: PENDING, COMPLETED

recipe_run
-
id PK int
created_timestamp timestamp # Time when recipe run was initiated
investment_run_id int FK >- investment_run.id
user_created_id int FK >- user.id # User which initiated the recipe run
approval_status enum # Possible statuses are Pending, Approved, Rejected
approval_user_id int NULLABLE FK >- user.id # User who approved/rejected the recipe run
approval_timestamp timestamp NULLABLE # Time and date when the user approved this recipe run
approval_comment nvarchar NULLABLE # Comment that should be provided when approving the recipe run

recipe_run_detail
-
id PK int
recipe_run_id int FK >- recipe_run.id
transaction_asset_id int FK >- asset.id
quote_asset_id int FK >- asset.id
target_exchange_id int FK >- exchange.id # The trading exchange on which trading is suggested acording the recipe run
investment_percentage decimal # Percentage that will be invested this way

recipe_order_group
-
id PK int
created_timestamp timestamp # Time when recipe order has been placed
recipe_run_id int FK >- recipe_run.id
approval_status enum # Possible statuses are Pending, Approved, Rejected
approval_user_id int FK >- user.id # User who approved/rejected the recipe order group
approval_timestamp timestamp # Time and date when the user approved this recipe order group
approval_comment nvarchar # Comment that should be provided when approving the order group

recipe_order
-
id PK int
recipe_order_group_id int FK >- recipe_order_group.id
instrument_id int FK >- instrument.id
side enum # Buy = 0 / Sell = 1
price decimal # Market price when the recipe order was placed
quantity decimal # Size of the order
status enum # Possible statuses are Pending, Executing, Completed, Rejected (by the user), Cancelled (manual intervention by user), Failed (due to technical issue which does not allow to continue)

execution_order
-
id PK int
recipe_order_id int FK >- recipe_order.id
instrument_id int FK >- instrument.id
exchange_id int FK >- exchange.id
external_identifier string # Order ID given by the exchange
side enum # Buy = 0 / Sell = 1
type enum # Market, Limit, Stop
price decimal # order price
total_quantity decimal # Order size
fee decimal # Fee deducted on during placement
status enum # Pending, Placed, FullyFilled, PartiallyFilled, Cancelled, Failed
placed_timestamp timestamp # Time the execution order has been placed
completed_timestamp timestamp # Time the execution order was fully filled or cancelled
time_in_force timestamp NULLABLE # time till when order should be active on exchange. NULL if order is Good Till Cancelled

execution_order_fill
-
id PK int
timestamp timestamp # Time of the fill
execution_order_id int FK >- execution_order.id
quantity decimal
price decimal # fill price
fee decimal # Fee deducted form fill

cold_storage_transfer
-
id PK int
recipe_run_order_id PK int FK >- recipe_order.id # ID of the recipe order for cold storage is needed
status enum # Pending - order was generated internally, but not yet sent, Sent - recipe order was sent to exchange or blockchain (waiting confirmation), Completed - when order reaches its final successful state, Failed - system failed to execute the order
placed_timestamp timestamp # Time when the order was generated
completed_timestamp timestamp # Time when the order reached its final state
cold_storage_account_id int # ID of the cold storage account to which the transfer will be made
asset_id int FK >- asset.id # Asset for which cold storage transfer will be made
amount decimal # Amount that will be transfered
fee decimal # Fees deducted when withdrawal from exchange to cold storage happened

action_log
# This table will log all actions of users and the system itself
-
id PK int # ID of the action 
timestamp timestamp # Timestamp when the action happened
performing_user_id int # User who performed the action
user_session_id int # User session during which the action was performed 
user_id int # Another user who was affected by the action
permission_id int # Permission which is related to the action
role_id int # Role which is related to the action
asset_id int # Asset which is related to the action
instrument_id int # Instrument which is related to the action
exchange_id int # Exchange which is related to the action
exchange_account_id int # Exchange account related to the action
investment_run_id int # Investment run related to the action
recipe_run_id int # Recipe run related to the action
recipe_run_deposit_id int # Recipe deposit related action
recipe_order_id int # Recipe order related to the action
execution_order_id int # Execution order related to the action
details nvarchar # More detailed information about the action

setting
# This table will contain system settings (controlled by admins via web interface)
-
id PK int
key string # Key that identifies the setting
value string # Value of the setting
type enum # Type of the setting: e.g. string, integer, etc.

instrument_liquidity_history
# This table will contain liquidity history of tradable instruments
-
id PK int
timestamp_from date # Timestamp from which liquidity was measured
timestamp_to date # Timestamp till which liquidity was measured
exchange_id int FK >- exchange.id
instrument_id int FK >- instrument.id
volume decimal
