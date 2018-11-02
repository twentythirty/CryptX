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

    @order_group_cache_cleanup
    Scenario: fail to generate due to missing cold storage accounts

        Given the system has the following Approved Recipe Order Group:
        | instrument | price | side | exchange | quantity | spend_amount | status |
        | XRP/BTC    | 0.005 | Buy | Bitfinex | 200    |   1   |   Completed     |
        | LTC/BTC    | 0.015 | Buy | Binance | 50    |   0.75   |   Completed     |
        | EOS/ETH    | 0.08 | Buy | OKEx | 9.375    |   7.5   |   Completed     |
        But there are no Cold Storage Accounts in the system
        When the system finished the task "generate cold storage transfers"
        Then no Cold Storage Transfers will be generated for the Recipe Order Group
        And a log is created for each missing Cold Storage Account