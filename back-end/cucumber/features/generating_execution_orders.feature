Feature: Generating execution orders

    Background: 

        Given the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for Binance
        And the system has updated the Instrument Market Data

    Scenario: Execution order generation for a partially filled order

        Given the system has Recipe Order with status Executing on Bitfinex
        And the Recipe Order has unfilled quantity above ccxt requirement
        When the system finished the task "generate execution orders"
        Then a new Execution Order is saved to the database
        And the Execution Order will have status Pending
        And the total quantity will be within exchange limits
        And the Execution Order placed timestamp and completed timestamp will not be set
        And the Execution Order price, fee and external identifier will not be set
        And the Execution Order side, instrument and exchange will be the same as the Order
        And the Execution Order type will be Market

    Scenario: Fully filled order with status Execution

        Given the system has Recipe Order with status Executing on Bitfinex
        And the Order is fully filled by a FullyFilled ExecutionOrder
        When the system finished the task "generate execution orders"
        Then the task will skip the Recipe Order due to Order was already filled
        And no new Execution Order is saved to the database

    @restore_settings
    Scenario: Last Execution Order quantity is not within limits

        Given the system has Recipe Order with status Executing on Binance
        And the setting "base trade fuzzyness" is set to 0
        And the Recipe Order is two Execution Orders short, one of which will be smaller than the minimum allowed by the Exchange
        When the system finished the task "generate execution orders"
        Then a new Execution Order is saved to the database
        And the total quantity will be within exchange limits
        And the last Execution Order will fulfill the Recipe Order required quantity

    Scenario: Generating Execution Orders until Recipe Order is completed

        Given the system has Recipe Order with status Executing on Bitfinex
        And the Order is not filled by Execuion Orders at all
        When the system does the task "generate execution orders" until it stops generating for the Order
        And the system finished the task "update recipe order statuses"
        Then the Recipe Order will have status Completed
        And the sum of Execution Order total quantities will equal the Recipe Order quantity

    Scenario: Completing recipe order when left amount to spend if is too small for exchange 

        Given the system has Recipe Order with status Executing on Bitfinex
        And the Order remaining amount is not within exchange minimum amount limits
        When the system finished the task "generate execution orders"
        And the system finished the task "update recipe order statuses"
        Then the Recipe Order will have status Completed