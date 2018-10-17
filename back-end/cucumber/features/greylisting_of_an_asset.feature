Feature: Greylistinf of an asset

    System periodically checks for assets that do not meet specific rules and greylists them.

    Background:

        Given the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for OKEx
        And the system has only WhiteListed Assets

    Scenario: Greylisting assets that do not meet the liqudity requirement

        Given the average XRP/BTC Liquidity for the last 3 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   19000   |   14500      |   15000   |
        |   2       |   22500   |   17450      |   19000   |
        |   3       |   23600   |   16500      |   18000   |
        And the system has Liquidity Requirement of 19000 for XRP/BTC for all Exchanges and periodicity of 3 days
        And the average ADA/ETH Liquidity for the last 3 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   15000   |   14500      |   15400   |
        |   2       |   16000   |   15400      |   14000   |
        |   3       |   12000   |   12000      |   12500   |
        And the system has Liquidity Requirement of 15000 for ADA/ETH for all Exchanges and periodicity of 3 days
        And the average BTG/ETH Liquidity for the last 3 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   19000   |   24000      |   23540   |
        |   2       |   18000   |   27500      |   21540   |
        |   3       |   18500   |   18000      |   24700   |
        And the system has Liquidity Requirement of 20500 for BTG/ETH for Binance and periodicity of 3 days
        And the average EOS/ETH Liquidity for the last 3 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   15400   |   25000      |   21000   |
        |   2       |   25466   |   27560      |   25410   |
        |   3       |   23600   |   26450      |   24410   |
        And the system has Liquidity Requirement of 25000 for EOS/ETH for Bitfinex and periodicity of 3 days
        And the average EOS/BTC Liquidity for the last 3 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   5000   |   7500      |   4120   |
        |   2       |   3540   |   2640      |   1250   |
        |   3       |   4850   |   3254      |   8000   |
        And the system has Liquidity Requirement of 7000 for EOS/BTC for Bitfinex and periodicity of 3 days
        And the average OMG/BTC Liquidity for the last 3 days is:
        |   day     |   Binance |   Bitfinex    |   OKEx    |
        |   1       |   100   |   125      |   164   |
        |   2       |   150   |   154      |   251   |
        |   3       |   140   |   171      |   152   |
        And the system has Liquidity Requirement of 1000 for OMG/BTC for OKEx and periodicity of 3 days
        But the Asset OMG is Blacklisted
        When the system finished the task "asset liquidity check"
        Then Assets ADA and BTG will be Greylisted
        And Assets EOS and XRP will remain Whitelisted
        And Asset OMG will remain Blacklisted
