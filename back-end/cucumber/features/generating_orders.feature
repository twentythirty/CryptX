Feature: Generating Orders

    Ability to generate new orders for recipe runs.

    Background:

        Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Instrument Mappings for Binance
        And the system has updated the Instrument Market Data
        And the system has Exchange Account for BTC on Binance
        And the system has Exchange Account for ETH on Binance
        And there is a LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details

    Scenario: Correct order generation when all of the conditions are met

        Given the system has Completed Deposits
        And the recipe run does not have recipe order group with status Pending
        And the recipe run does not have recipe order group with status Approved
        When I log onto CryptX as Trader
        And I generate new Orders for the Approved Recipe Run
        Then a new Recipe Group is created with the status Pending
        And only one Recipe Order is created for each Recipe Run Detail
        And the Recipe Order Instrument will be based on the quote and transaction assets of the corresponding Detail
        And the Recipe Order Exchange will be the same as the corresponding Detail
        And if Order`s Instrument and Detail transaction assets match, then the Order side will be Buy
        And if Order`s Instrument and Detail transaction assets do not match, then the Order side will be Sell
        And the Recipe Orders have the status Pending
        And the Investment Run will have status OrdersGenerated
        But the system won't allow me to generate Recipe Orders while this group is not Rejected

    Scenario: Order generation when Deposits are not completed

        Given the system has Pending Deposits
        And the recipe run does not have recipe order group with status Pending
        And the recipe run does not have recipe order group with status Approved
        When I log onto CryptX as Trader
        And I generate new Orders for the Approved Recipe Run
        Then I should see an error message describing that there are Pending Deposits
        And no Orders were generated for the Recipe Run

    Scenario: Order generation with faulty Deposits

        Given the system has Faulty Deposits
        And the recipe run does not have recipe order group with status Pending
        And the recipe run does not have recipe order group with status Approved
        When I log onto CryptX as Trader
        And I generate new Orders for the Approved Recipe Run
        Then I should see an error message describing that Deposits have invalid values
        And no Orders were generated for the Recipe Run

    Scenario: precise order quantity and price

        Given the Recipe Run Details are as followed:
        | transaction_asset | quote_asset | exchange | percentage | investment_amount   | investment_currency   |
        |   XRP     |   BTC |   Binance |   50  |   25000/0/0   |   USD/BTC/ETH |
        |   XRP     |   ETH |   Binance |   50  |   25000/0/0   |   USD/BTC/ETH |
        And the current price of BTC is 6800 USD
        And the current price of ETH is 850 USD
        And the current price of XRP is 0.001 BTC
        And the current price of XRP is 0.07 ETH
        And the Recipe Run Deposits are as followed:
        | amount    | asset | exchange  | fee   | status    |
        |  3.6  | BTC   | Binance   | 0.0765    | Completed |
        | 29.4  | ETH   | Binance   | 0.0117    | Completed |
        And the recipe run does not have recipe order group with status Pending
        And the recipe run does not have recipe order group with status Approved
        When I log onto CryptX as Trader
        And I generate new Orders for the Approved Recipe Run
        Then a new Recipe Group is created with the status Pending
        And the Recipe Orders will have the folowing prices and quantities:
        | instrument| side  | exchange  | price | quantity  |
        | XRP/BTC   | Buy   | Binance   | 0.001     | 3600     |
        | XRP/ETH   | Buy   | Binance   | 0.07     | 420     |