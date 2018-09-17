Feature: Generating execution orders

    Background: 

        Given the system has Instrument Mappings for Kraken
        And the system has updated the Instrument Market Data

    Scenario: Execution order generation for a partially filled order

        Given the system has Recipe Order with status Executing on Kraken
        And the Recipe Order has unfilled quantity above ccxt requirement
        When the system finished the task "generate execution orders"
        Then a new Execution Order is saved to the database
        And the Execution Order will have status Pending
        And the total quantity will be within exchange limits
        And the initial price will not be set

    Scenario: Fully filled order with status Execution

        Given the system has Recipe Order with status Executing on Kraken
        And the Order is fully filled by a FullyFilled ExecutionOrder
        When the system finished the task "generate execution orders"
        Then the task will skip the Recipe Order due to Order was already filled
        And no new Execution Order is saved to the database

    Scenario: Next total quantity of the Execution Order is not within limits

        Given the system has Recipe Order with status Executing on Kraken
        And the Order remaining amount is not within exchange minimum amount limits
        When the system finished the task "generate execution orders"
        Then the task will skip the Recipe Order due to next total being not within limits
        And no new Execution Order is saved to the database