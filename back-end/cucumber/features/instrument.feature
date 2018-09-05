Feature: Instrument

    I have the ability to add instruments and map them to exchanges

    Background:
    
        Given the system has an Compliance Manager

    Scenario: New Instrument

        Given there are no Instruments in the system
        When I log onto CryptX as Compliance Manager
        And I select two different Assets
        And I create a new Instrument with those Assets
        Then the new Instrument is saved to the database
        And a symbol is created from the selected Assets
        But I cannot create a new Instrument with the same Assets by switching them around

    Scenario: New Instrument Exchange Mapping

        Given there is an Instrument that can be Mapped to Kraken
        When I log onto CryptX as Compliance Manager
        And I have selected an Instrument to map
        And I find a matching external identifier for the selected Instrument from Kraken
        And I create a new Exchange Mapping with my selections
        Then the new Mapping is saved to the database
        But I can only have one Instrument Mapping for each Exchange per Instrument