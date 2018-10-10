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
        |   Binance |   Bitfinex    |   OKEx    |
        |   12220   |   142354      |   21000   |
        And the current price of XRP is 0.00025 BTC
        And the system has Liquidity Requirement 10000 for XRP/BTC for Binance and periodicity of 7 days
        When I log onto CryptX as Compliance Manager
        And I retrieve the Liquidity Requirement details for XRP/BTC instrument
        Then if I look at the Liquidity Requirement details
        Then I see data layout:
        | instrument    | periodicity   | quote_asset   | minimum_circulation   | exchange  | exchange_count    | exchange_not_pass |
        | XRP/BTC   |   7   |   BTC     |   10000   |   Binance |   1   |   0   |
        And if I look at the Liquidity Requirement Exchanges list
        Then I see data layout:
        | exchange  | instrument_identifier | current_price | last_day_volume | last_week_volume    | passes |
        | Binance   | XRP/BTC   | 0.00025   |   12220 |   12220 |   MeetsLiquidityRequirements  |
        Then if I look at the Liquidity Requirement Exchanges footer
        Then I see data layout:
        | exchange  | instrument_identifier | passes    |
        | 1 Exchanges   | 1 Identifiers  | 0 Lacking |
        

    Scenario: view liquidity requirement details for all exchanges

        Given the Instrument EOS/ETH is not mapped to Bittrex, Bitstamp, HitBTC, Kraken and Huobi 
        Given the average EOS/ETH Liquidity for the last 7 days is:
        |   Binance |   Bitfinex    |   OKEx    |
        |   3520   |   2990      |   3200   |
        And the current price of EOS is 0.007 ETH
        And the system has Liquidity Requirement 3000 for EOS/ETH for all Exchanges and periodicity of 7 days
        When I log onto CryptX as Compliance Manager
        And I retrieve the Liquidity Requirement details for EOS/ETH instrument
        Then if I look at the Liquidity Requirement details
        Then I see data layout:
        | instrument    | periodicity   | quote_asset   | minimum_circulation   | exchange  | exchange_count    | exchange_not_pass |
        | EOS/ETH   |   7   |   ETH     |   3000   |   All |   3   |   1   |
        And if I look at the Liquidity Requirement Exchanges list
        Then I see data layout:
        | exchange  | instrument_identifier | current_price | last_day_volume | last_week_volume    | passes |
        | Binance   | EOS/ETH   | 0.007   |   3520 |   3520 |   MeetsLiquidityRequirements  |
        | Bitfinex   | EOS/ETH   | 0.007   |   2990 |   2990 |   Lacking  |
        | OKEx   | EOS/ETH   | 0.007   |   3200 |   3200 |   MeetsLiquidityRequirements  |
        Then if I look at the Liquidity Requirement Exchanges footer
        Then I see data layout:
        | exchange  | instrument_identifier | passes    |
        | 3 Exchanges   | 1 Identifiers  | 1 Lacking |