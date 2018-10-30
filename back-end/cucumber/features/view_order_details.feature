Feature: View order details

    Viewing order details and a list of associated execution orders

    Background:

        Given the system has a Trader
        And the system has Instrument Mappings for Binance

    Scenario: view details of a pending recipe order

        Given the system has Pending Recipe Order to sell 1.85 ETH for XRP at the price of 0.115625 on Binance
        And the Recipe Order was created on Sat, 06 Oct 2018 19:50:09
        When I log onto CryptX as Trader
        And I fetch the Recipe Order details
        Then if I look at the Recipe Order details
        Then I see data layout:
        | instrument    | side  | price | quantity  | spend_amount  | sum_of_exchange_trading_fee   | status    | created_timestamp |
        |   XRP/ETH | Buy   | 0.115625  | 16    |   1.85    |   0   |   Pending     |    Sat Oct 06 2018 19:50:09  |
        And if I look at the Execution Orders list
        Then I see an empty table

