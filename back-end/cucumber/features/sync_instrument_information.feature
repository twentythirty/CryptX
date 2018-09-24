Feature: Synchronization of Instrument information

    System should periodically fetch information about the instruments
    from the exchanges.

    Background: 

        Given the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for OKEx

    Scenario: fetch instrument volumes from exchanges for the last 24 hours

        Given the system does not have Instrument Liquidity History
        When the system finished the task "fetch instrument volumes"
        Then the system creates a new entry for each ticker it fetched with a valid volume
        And the timestamp difference should be 24 hours

    Scenario: fetch newest instruments ask and bid prices from exchanges
  
        Given the system does not have Instrument Market Data
        When the system finished the task "fetch instruments ask/bid prices"
        Then the system creates a new entry for each Instrument that has a valid mapping
        And a log entry is created for each Instrument which did not have a price on the exchange


    