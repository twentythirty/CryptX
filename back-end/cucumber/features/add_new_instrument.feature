Feature: Add a new instrument

    Creates a new instriment from a pair of assets

    Background:
    
        Given the system has a Compliance Manager

    Scenario: new valid instrument

        Given there are no Instruments in the system
        When I log onto CryptX as Compliance Manager
        And I select two different Assets
        And I create a new Instrument with those Assets
        Then the new Instrument is saved to the database
        And a symbol is created from the selected Assets
        But I cannot create a new Instrument with the same Assets by switching them around

    Scenario: attempting to create an instrument with two same assets

        Given there are no Instruments in the system
        When I log onto CryptX as Compliance Manager
        But I select two same Assets
        And I create a new Instrument with those Assets
        Then the system will display an error about not using two different assets