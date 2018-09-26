Feature: Retrieving updated execution order information from exchanges

    CryptX should poll the exchanges from updates on the placed
    Execution Orders and sync the information with it`s database

    Background:

        Given there are 3 Pending Execution Orders for Binance

    Scenario: fetching Execution order information until it is fully filled

        Given the Pending Execution Orders are placed on the exchanges
        When the system does the task "fetch execution order information" until the Execution Orders are no longer InProgress
        Then the Execution Orders status will be FullyFilled
        And an Execution Order Fill is created for each Trade fetched from the exchange
        And the Execution Order fee and total quantity will equal the sum of fees and quantities of Execution Order Fills
        And the Execution Order price will equal to the weighted average of Fill prices
        And an Action Log is created for each new Execution Order Fill
        And an Action Log is created for each FullyFilled Order
