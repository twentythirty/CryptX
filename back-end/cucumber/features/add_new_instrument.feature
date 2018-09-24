Feature: Add a new instrument

    Creates a new instriment from a pair of assets

    Background:
    
        Given the system has a Compliance Manager

    Scenario: creating a new instrument using different assets as quote and transaction assets

        Given there are no Instruments in the system
        When I log onto CryptX as Compliance Manager
        And I select different Assets as quote and transaction assets
        And I create a new Instrument with those Assets
        Then the new Instrument is saved to the database
        And a symbol is created from the selected Assets
        But I cannot create a new Instrument with the same Assets by switching them around

    Scenario: attempting to create an instrument with the same asset as quote and transaction asset

        Given there are no Instruments in the system
        When I log onto CryptX as Compliance Manager
        But I select the same Asset as quote and transaction asset
        And I create a new Instrument with those Assets
        Then the system will display an error about not using two different assets