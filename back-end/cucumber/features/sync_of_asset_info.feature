Feature: Synchronization of asset information

    Assets are synchronized from CoinMarketAPI on daily bases.

    Scenario: Asset synchronization job run

        Given the system has some missing Assets from CoinMarketCap, including ETH and BTC
        When the system completes the task "synchronize coins list"
        Then the missing Assets are saved to the database
        And BTC and ETH are marked as base and deposit Assets

    Scenario: Asset market history fetching job run

        Given the system has no Asset market history
        And the system is missing some of the top 100 coins
        When the system completes the task "fetch asset market capitalization"
        Then missing Assets were saved to the database
        And Asset market history is saved to the database