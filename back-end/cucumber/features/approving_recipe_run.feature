Feature: Approving Recipe Run

    Ability to approve generated recipe run for a given investment run.

    Background:

        Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Instrument Mappings for Kraken
        And the system has updated the Instrument Market Data
        And there is a LCI Investment Run created by an Investment Manager


    Scenario: reject a pending recipe run
    
        Given there is a recipe run with status Pending
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe run
        And reject recipe run with provided rationale
        Then the recipe run will have status Rejected
        And the recipe run will have no conversions
        And the investment run status will remain unchanged