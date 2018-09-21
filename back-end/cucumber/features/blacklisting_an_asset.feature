Feature: Balcklisting an asset

    Users have the ability to blacklist assets.

    Background:

        Given the system has an Compliance Manager
        And the system has Asset Market Capitalization for the last 2 hours

    Scenario: successfully blacklisting an asset

        Given the system has only WhiteListed Assets
        When I log onto CryptX as Compliance Manager
        And I provide a rationale
        And I Blacklist an Asset
        Then a new Asset Status Change entry is saved to the database with the correct type
        And the rationale I provided is saved
        And I am assigned to the Status Change
        And I can see the new status and history by getting the Asset details
        But I cannot Blacklist an Asset which is already Blacklisted

    Scenario: blacklisting an asset without providing a rationale

        Given the system has only WhiteListed Assets
        When I log onto CryptX as Compliance Manager
        But I provide an empty rationale
        And I Blacklist an Asset
        Then the system displays an error about not providing a valid rationale
        And a new Asset Status Change entry is not created