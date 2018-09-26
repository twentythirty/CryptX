Feature: Retrieving updated execution order information from exchanges

    CryptX should poll the exchanges from updates on the placed
    Execution Orders and sync the information with it`s database

    Background:

        Given there are 3 Pending Execution Orders for Binance

    Scenario: fetching execution order information until it is fully filled

        Given the Pending Execution Orders are placed on the exchanges
        When the system does the task "fetch execution order information" until the Execution Orders are no longer in progress
        Then the Execution Orders status will be FullyFilled
        And an Execution Order Fill is created for each Trade fetched from the exchange
        And the Execution Order fee and total quantity will equal the sum of fees and quantities of Execution Order Fills
        And the Execution Order price will equal to the weighted average of Fill prices
        And an Action Log is created for each new Execution Order Fill
        And an Action Log is created for each FullyFilled Order

    Scenario: execution orders are closed before being filled

        Given the Pending Execution Orders are placed on the exchanges
        But the Execution Orders expire on the exchange before getting filled
        When the system does the task "fetch execution order information" until the Execution Orders are no longer in progress
        Then the Execution Orders status will be NotFilled or PartiallyFilled
        And Execution Orders with status PartiallyFilled will have at least 1 Fill
        But Execution Orders with status NotFilled will have 0 Fills