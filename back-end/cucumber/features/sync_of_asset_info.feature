Feature: Synchronization of asset information

   Assets are synchronized from CoinMarketAPI on daily bases.

   Scenario: Asset synchronization job run

        Given the system has some missing Assets rom CoinMarketCap, including ETH and BTC
        When the SYNC_COINS job complete it`s run
        Then the missing Assets are saved to the database
        And BTC and ETH are marked as base and deposit Assets