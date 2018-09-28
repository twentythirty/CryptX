Feature: Add a new liquidity requiremen

    System allows to add liquidity requirements to instruments.

    Background:

        Given the system has a Compliance Manager
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for Binance

    Scenario: new valid liquidity requirement for a single exchange

        Given there are no Liquidity Requirements in the system
        When I log onto CryptX as Compliance Manager
        And I select an Instrument which is mapped to Bitfinex
        And I add a Liquidity Requirement for Bitfinex
        Then the new Liquidity Requirement is saved to the database
        And I cannot add another Requirement for the same Instrument and Exchange
        But I can add another Requirement to the same Instrument by choosing a different Exchange

