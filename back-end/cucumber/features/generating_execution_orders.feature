Feature: Generating execution orders

    Background: 

        Given the system has Instrument Mappings for Kraken
        And the system has updated the Instrument Market Data

    Scenario: Execution order generation for a partially filled order

        Given the system has Recipe Order with status Executing on Kraken
        And the Order is partially filled by a few FullyFilled ExecutionOrders
        When the system finished the task "generate execution orders"
        Then a new Execution Order is saved to the database
        And the Execution Order will have status Pending
        And the total quantity will be within exchange limits
        And the initial price will not be set