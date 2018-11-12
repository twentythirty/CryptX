Feature: Generating cold storage transfers

    Once all orders from a recipe group are complete,
    cold storage transfers should be generated for each roder

    Background:

        Given the system has a Investment Manager
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for OKEx
        And there is a LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details
        And the system does not have Recipe Order Groups

    @order_group_cache_cleanup
    Scenario: ignore order group if at least one order is not completed

        Given the system has the following Approved Recipe Order Group:
        | instrument | price | side | exchange | quantity | spend_amount | status | fees    |
        | XRP/BTC    | 0.005 | Buy | Bitfinex | 200    |   1   |   Completed     |  5   |
        | LTC/BTC    | 0.015 | Buy | Binance | 50    |   0.75   |   Completed     | 1.5 |
        | EOS/ETH    | 0.08 | Buy | OKEx | 9.375    |   7.5   |   Executing     | 0.075 |
        When the system finished the task "generate cold storage transfers"
        Then no Cold Storage Transfers will be generated for the Recipe Order Group

    @order_group_cache_cleanup
    Scenario: fail to generate due to missing cold storage accounts

        Given the system has the following Approved Recipe Order Group:
        | instrument | price | side | exchange | quantity | spend_amount | status | fees    |
        | XRP/BTC    | 0.005 | Buy | Bitfinex | 200    |   1   |   Completed     |  5   |
        | LTC/BTC    | 0.015 | Buy | Binance | 50    |   0.75   |   Completed     | 1.5 |
        | EOS/ETH    | 0.08 | Buy | OKEx | 9.375    |   7.5   |   Completed     | 0.075 |
        But there are no Cold Storage Accounts in the system
        When the system finished the task "generate cold storage transfers"
        Then no Cold Storage Transfers will be generated for the Recipe Order Group
        And a log is created for each missing Cold Storage Account

    @order_group_cache_cleanup
    Scenario: fail to generate if the balance on the exchange is equal to zero

        Given the system has the following Approved Recipe Order Group:
        | instrument | price | side | exchange | quantity | spend_amount | status | fees    |
        | XRP/BTC    | 0.005 | Buy | Bitfinex | 200    |   1   |   Completed     |  5   |
        | LTC/BTC    | 0.015 | Buy | Binance | 50    |   0.75   |   Completed     | 1.5 |
        | EOS/ETH    | 0.08 | Buy | OKEx | 9.375    |   7.5   |   Completed     | 0.075 |
        And the system has LCI Cold Storage Account for LTC
        And the system has LCI Cold Storage Account for XRP
        And the system has LCI Cold Storage Account for EOS
        But the current balances on the exchanges are:
        | exchange  |   XRP     |   LTC     |   EOS     |
        | Bitfinex  |   0       |   0.54    |   0       |
        | Binance   |   0       |   1       |   0       |
        | OKEx      |   0.0254  |   0.1     |   0       |
        When the system finished the task "generate cold storage transfers"
        Then no Cold Storage Transfers will be generated for the Recipe Order Group
        And a log is created for each required empty balance

    #@order_group_cache_cleanup
    Scenario: generate a cold storage transfer for each recipe order in the group

        Given the system has the following Approved Recipe Order Group:
        | instrument | price | side | exchange | quantity | spend_amount | status | fees    |
        | XRP/BTC    | 0.005 | Buy | Bitfinex | 200    |   1   |   Completed     |  5   |
        | LTC/BTC    | 0.015 | Buy | Binance | 50    |   0.75   |   Completed     | 1.5 |
        | EOS/ETH    | 0.08 | Buy | OKEx | 9.375    |   7.5   |   Completed     | 0.075 |
        And the system has LCI Cold Storage Account for LTC
        And the system has LCI Cold Storage Account for XRP
        And the system has LCI Cold Storage Account for EOS
        And the system has MCI Cold Storage Account for LTC
        And the system has MCI Cold Storage Account for XRP
        And the system has MCI Cold Storage Account for EOS
        And the current balances on the exchanges are:
        | exchange  |   XRP     |   LTC     |   EOS     |
        | Bitfinex  |   198       |   0    |   0       |
        | Binance   |   0       |   52       |   0       |
        | OKEx      |   0  |   0     |   9.175       |
        And the current withdraw fees on the exchanges are:
        | exchange  |   XRP     |   LTC     |   EOS     |
        | Bitfinex  |   2       |   0.5    |   0.08       |
        | Binance   |   3       |   0.9       |   0.1       |
        | OKEx      |   1.8  |   0.85     |   0.085       |
        When the system finished the task "generate cold storage transfers"
        Then the following Cold Storage Transfers will be created:
        | asset | amount    | fee   | status    |
        | XRP   | 198   |   2   |   Pending     |
        | LTC   | 50  |   0.9 |   Pending     |
        | EOS   | 9.175  |   0.085   | Pending   |
        And a matching Cold Storage Account is assinged to each Transfer   