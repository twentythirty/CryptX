Feature: Retrieving updated execution order information from exchanges

    CryptX should poll the exchanges from updates on the placed
    Execution Orders and sync the information with it`s database

    Background:

        Given the system has Instrument Mappings for Bitfinex
        Given the system has updated the Instrument Market Data
        And there are 3 Pending Execution Orders for Bitfinex

    Scenario: fetching execution order information until it is fully filled

        Given the Pending Execution Orders are placed on the exchanges
        When the system does the task "fetch execution order information" until the Execution Orders are no longer in progress
        Then the Execution Orders status will be FullyFilled
        And an Execution Order Fill is created for each Trade fetched from the exchange
        And the Execution Order fee and total quantity will equal the sum of fees and quantities of Execution Order Fills
        And the Execution Order price will equal to the weighted average of Fill prices
        And an Action Log is created for each new Execution Order Fill
        And an Action Log is created for each FullyFilled Order

    Scenario: updating execution order information when trades are not available

        Given the Pending Execution Orders are placed on the exchanges
        But the Exchange does not support Trade fetching
        When the system does the task "fetch execution order information" until the Execution Orders are no longer in progress
        Then the Execution Orders status will be FullyFilled
        And the Execution Order price and fee will be taken from the Order received from the Exchange
        And sums of fees and quantity of Fills will equal to Execution Order ones
        And the price of Fills will equal to the price of the Execution Order

    Scenario: execution orders are closed before being filled

        Given the Pending Execution Orders are placed on the exchanges
        But the Execution Orders expire on the exchange before getting filled
        When the system does the task "fetch execution order information" until the Execution Orders are no longer in progress
        Then the Execution Orders status will be NotFilled or PartiallyFilled
        And Execution Orders with status PartiallyFilled will have at least 1 Fill
        But Execution Orders with status NotFilled will have 0 Fills
        
    Scenario: execution orders fail after exceeding the the failed attempts threshold

        Given the Pending Execution Orders are placed on the exchanges
        But the Exchange is unable to find the Execution Orders
        When the system does the task "fetch execution order information" until the Execution Orders are no longer in progress
        Then the Execution Orders status will be NotFilled
        And the Execution Orders failed attempts will equal to the threshold specified in the system settings
        And the Execution Orders errors are logged