Feature: Add a new liquidity requiremen

    System allows to add liquidity requirements to instruments.

    Background:

        Given the system has a Compliance Manager
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for OKEx

    Scenario: new valid liquidity requirement for a single exchange

        Given there are no Liquidity Requirements in the system
        When I log onto CryptX as Compliance Manager
        And I select an Instrument which is mapped to Bitfinex and Binance
        And I add a Liquidity Requirement for Bitfinex
        Then the new Liquidity Requirement is saved to the database
        And I cannot add another Requirement for the same Instrument and Exchange
        But I can add another Requirement to the same Instrument by choosing a different Exchange

    Scenario: attempting to add a liquidity requirement for an instrument with missing exchange mappings

        Given there are no Liquidity Requirements in the system
        And the system is missing Instrument Mappings for OKEx
        When I log onto CryptX as Compliance Manager
        And I select an Instrument which is not mapped to OKEx
        And I add a Liquidity Requirement for OKEx
        Then the system will display an error about my selected instrument not having mappings for OKEx
        And a new Liquidity Requirement is not created

    Scenario: new valid liquidity requirement for all exchanges

        Given there are no Liquidity Requirements in the system
        When I log onto CryptX as Compliance Manager
        And I select an Instrument which is mapped to all Exchanges
        And I add a Liquidity Requirement for all Exchanges
        Then the new Liquidity Requirement is saved to the database
        And no specific Exchange is assigned to the Liquidity Requirement
        And I cannot add any more Liquidity Requirements for this Instrument

