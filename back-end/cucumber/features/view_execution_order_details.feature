Feature: View execution order details

    View a single execution order with it's fills and action log

    Background: 

        Given the system has a Trader
        And the system has Instrument Mappings for Binance

    @execution_orders_cache_cleanup
    Scenario: view pending execution order details

        Given there is 1 Pending Execution Order for Binance
        And the Execution Order is buying 45 DOCK using BTC
        When I log onto CryptX as Trader
        And I fetch the Execution Order details
        Then if I look at the Execution Order details
        Then I see data layout:
        | instrument    | side  | type  | exchange  | price | total_quantity | filled_quantity  | exchange_trading_fee  | status |
        | DOCK/BTC  | Buy   |   Market  | Binance | -   | 45    | 0 | - | Pending   |
        And if I look at the Execution Order Fills list
        Then I see an empty table

    @execution_orders_cache_cleanup
    Scenario: view in progress execution order details

        Given there is 1 InProgress Execution Order for Binance
        And the Execution Order is buying 20 EOS using ETH
        And the Execution Order was priced at 0.4 ETH and feed at 0.002 ETH on the Exchange
        And the Execution Order was half filled by 4 Fills on Sat, 06 Oct 2018 23:10:05
        When I log onto CryptX as Trader
        And I fetch the Execution Order details
        Then if I look at the Execution Order details
        Then I see data layout:
        | instrument    | side  | type  | exchange  | price | total_quantity | filled_quantity  | exchange_trading_fee  | status |
        | EOS/ETH  | Buy   |   Market  | Binance | 0.4   | 20    | 10 | 0.002 | InProgress   |
        And if I look at the Execution Order Fills list
        Then I see data layout:
        | fill_price    | quantity   | fill_time    |
        | 0.4   | 2.5   |   Sat Oct 06 2018 23:10:05   |
        | 0.4   | 2.5   |   Sat Oct 06 2018 23:10:05   |
        | 0.4   | 2.5   |   Sat Oct 06 2018 23:10:05   |
        | 0.4   | 2.5   |   Sat Oct 06 2018 23:10:05   |
        And if I look at the Execution Order Fills footer
        Then I see data layout:
        | fill_price    | quantity   | fill_time    |
        | 0.40000000000000000000 average  | 10.0 total   |   -   |
        And if I look at the Execution Order logs
        Then I see data layout:
        |   timestamp   |   entry    |
        |   Sat Oct 06 2018 23:10:05    |   Retrieved a new fill with amount of 2.5     |
        |   Sat Oct 06 2018 23:10:05    |   Retrieved a new fill with amount of 2.5     |
        |   Sat Oct 06 2018 23:10:05    |   Retrieved a new fill with amount of 2.5     |
        |   Sat Oct 06 2018 23:10:05    |   Retrieved a new fill with amount of 2.5     |