Feature: View liquidity requirement details

    In the liqudiity requirement details page, users will see the details about
    the requirement, plus the exchanges that pass or don't pass thr rquirement.

    Background:

        Given the system has a Compliance Manager
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for OKEx
        And the system has Instrument Liquidity History for the last 7 days
        And the system has updated the Instrument Market Data

    Scenario: view liquidity requirement details for a single exchange

        Given the system has Liquidity Requirement for XRP/BTC for Binance and periodicity of 7 days
        When I log onto CryptX as Compliance Manager
        And I retrieve the Liquidity Requirement details for XRP/BTC instrument
        Then I will see the details of the Liquidity Requirement
        And the number of Exchanges for the Liquidity Requirement will be 1
        And the Exchange list will contain the Instrument current price, last day volume and average volume for the past week
        And Exchanges that pass the requirement are marked accordinally

    Scenario: view liquidity requirement details for all exchanges

        Given the system has Liquidity Requirement for XRP/ETH for all Exchanges and periodicity of 7 days
        When I log onto CryptX as Compliance Manager
        And I retrieve the Liquidity Requirement details for XRP/ETH instrument
        Then I will see the details of the Liquidity Requirement
        And the number of Exchanges will be the number of Exchanges that have mappings for XRP/ETH
        And the Exchange list will contain the Instrument current price, last day volume and average volume for the past week
        And Exchanges that pass the requirement are marked accordinally