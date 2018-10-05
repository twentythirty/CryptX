Feature: View execution order details

    View a single execution order with it's fills and action log

    Background: 

        Given the system has a Trader
        And the system has Instrument Mappings for Binance

    Scenario: view pending execution order details

        Given there is 1 Pending Execution Order for Binance
        And the Execution Order is buying 45 DOCK using BTC
        When I log onto CryptX as Trader
        And I fetch the Execution Order details
        Then if I look at the Execution Order details
        Then I see data layout:
        | instrument    | side  | exchange  | price | total_quantity | filled_quantity  | exchange_trading_fee  | status |
        | DOCK/BTC  | Buy   | Binance | -   | 45    | 0 | - | Pending   |
        And if I look at the Execution Order Fills list
        Then I see an empty table

