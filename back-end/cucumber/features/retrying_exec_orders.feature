Feature: Retrying a failed execution order

    Execution Orders that failed to be placed on the exchanges can be retried again

    Background:

        Given the system has Instrument Mappings for Bitfinex
        And there are 2 InProgress Execution Orders for Bitfinex
        And there are 3 PartiallyFilled Execution Orders for Bitfinex
        And there are 2 Pending Execution Orders for Bitfinex
        And the system has a Trader

    Scenario: retrying a failed execution order

        Given the Pending Execution Orders Failed to be placed on the Exchanges
        When I log onto CryptX as Trader
        And I select a Failed Execution Order
        And I see logs related to the the failure from the Execution Order details
        And I retry the Execution Order
        Then the Execution Order status will be Pending
        And the number of failed attempts on the Executon Order will reset back to 0
        But the system won't allow me to retry Execution Orders with status other than Failed
