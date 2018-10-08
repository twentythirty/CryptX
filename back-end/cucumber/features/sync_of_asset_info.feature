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

    Scenario: Asset NVT calculation when some assets lack the required market data

        Given the system does not have Market History Calculations
        And the system has Asset Market Capitalization for the last 7 days
        But some Assets only have Market Capitalization for the last 6 days
        When the system finished the task "calculate market history"
        Then the system will save the NVT calculations of the Assets
        But Assets that don't have Market Capitalization data for the last 7 days will be ignored

    Scenario: weekly NVT calculation for a single asset

        Given the system does not have Market History Calculations
        And the Market Capitalization for BTC is as follows:
            |  day  |  capitalization_usd  |  daily_volume_usd  |  market_share  |
            | 1  |  151351351  | 35352  | 37.6  |
            | 2  |  145463463  | 34512  | 37.8  |
            | 3  |  145452113  | 34250  | 37.3  |
            | 4  |  151456781  | 34010  | 37.6  |
            | 5  |  151759742  | 34199  | 37.9  |
            | 6  |  152002101  | 36452  | 38.0  |
            | 7  |  151895643  | 35846  | 37.8  |
        When the system finished the task "calculate market history"
        Then the BTC weekly NVT will appropriately be equal to 4346.599437