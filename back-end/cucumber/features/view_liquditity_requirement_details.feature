Feature: View liquidity requirement details

    In the liqudiity requirement details page, users will see the details about
    the requirement, plus the exchanges that pass or don't pass thr rquirement.

    Background:

        Given the system has a Compliance Manager
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for OKEx

    Scenario: view liquidity requirement details for a single exchange

        Given the average XRP/BTC Liquidity for the last 7 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   19000   |   142354      |   21000   |
        |   2       |   22500   |   145672      |   19000   |
        |   3       |   23600   |   134531      |   22500   |
        |   4       |   22500   |   142732      |   23100   |
        |   5       |   22200   |   154999      |   21900   |
        |   6       |   18000   |   127432      |   20500   |
        |   7       |   12200   |   156632      |   20000   |
        And the current price of XRP is 0.00025 BTC
        And the system has Liquidity Requirement 19000 for XRP/BTC for Binance and periodicity of 7 days
        When I log onto CryptX as Compliance Manager
        And I retrieve the Liquidity Requirement details for XRP/BTC instrument
        Then if I look at the Liquidity Requirement details
        Then I see data layout:
        | instrument    | periodicity   | quote_asset   | minimum_circulation   | exchange  | exchange_count    | exchange_not_pass |
        | XRP/BTC   |   7   |   BTC     |   19000   |   Binance |   1   |   0   |
        And if I look at the Liquidity Requirement Exchanges list
        Then I see data layout:
        | exchange  | instrument_identifier | current_price | last_day_vol | last_week_vol    | passes |
        | Binance   | XRP/BTC   | 0.00025   |   12200 |   20000 |   MeetsLiquidityRequirements  |
        Then if I look at the Liquidity Requirement Exchanges footer
        Then I see data layout:
        | exchange  | instrument_identifier | passes    |
        | 1 Exchanges   | 1 Identifiers  | 0 Lacking |
        

    Scenario: view liquidity requirement details for all exchanges

        Given the Instrument EOS/ETH is not mapped to Bittrex, Bitstamp, HitBTC, Kraken and Huobi 
        Given the average EOS/ETH Liquidity for the last 7 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   3500   |   1450      |   4600   |
        |   2       |   3100   |   1300      |   4400   |
        |   3       |   2900   |   1350      |   4100   |
        |   4       |   2950   |   2800      |   3200   |
        |   5       |   3150   |   2900      |   2850   |
        |   6       |   3050   |   3100      |   2300   |
        |   7       |   3400   |   3795      |   2350   |
        And the current price of EOS is 0.007 ETH
        And the system has Liquidity Requirement 3000 for EOS/ETH for all Exchanges and periodicity of 4 days
        When I log onto CryptX as Compliance Manager
        And I retrieve the Liquidity Requirement details for EOS/ETH instrument
        Then if I look at the Liquidity Requirement details
        Then I see data layout:
        | instrument    | periodicity   | quote_asset   | minimum_circulation   | exchange  | exchange_count    | exchange_not_pass |
        | EOS/ETH   |   4   |   ETH     |   3000   |   All |   3   |   1   |
        And if I look at the Liquidity Requirement Exchanges list
        Then I see data layout:
        | exchange  | instrument_identifier | current_price | last_day_vol | last_week_vol   | passes |
        | Binance   | EOS/ETH   | 0.007   |   3400 |   3150 |   MeetsLiquidityRequirements  |
        | Bitfinex   | EOS/ETH   | 0.007   |   3795 |   2385 |   MeetsLiquidityRequirements  |
        | OKEx   | EOS/ETH   | 0.007   |   2350 |   3400 |   Lacking  |
        Then if I look at the Liquidity Requirement Exchanges footer
        Then I see data layout:
        | exchange  | instrument_identifier | passes    |
        | 3 Exchanges   | 1 Identifiers  | 1 Lacking |