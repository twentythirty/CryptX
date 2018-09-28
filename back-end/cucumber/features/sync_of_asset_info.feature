Feature: Synchronization of asset information

    Assets are synchronized from CoinMarketAPI on daily bases.

    Background: 

        Given the system has no Asset market history

    Scenario: Asset synchronization with CoinMarketCap

        Given the system has some missing Assets from CoinMarketCap, including ETH and BTC
        When the system completes the task "synchronize coins list"
        Then the missing Assets are saved to the database
        And BTC and ETH are marked as base and deposit Assets

    Scenario: Fetching asset market history from CoinMarketCap

        Given the system is missing some of the top 100 coins
        When the system completes the task "fetch asset market capitalization"
        Then missing Assets were saved to the database
        And Asset market history is saved to the database

    Scenario: Asset NVT calculation

        Given the system does not have Market History Calculations
        And the system has Asset Market Capitalization for the last 7 days
        But some Assets only have Market Capitalization for the last 6 days
        When the system finished the task "calculate market history"
        Then the system will save the NVT calculations of the Assets
        But Assets that don't have Market Capitalization data for the last 7 days will be ignored