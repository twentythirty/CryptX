Feature: Asset

    In the system, you can manage which assets are black listed, grey listed
    and white listed.

    Background:

        Given the system has an Compliance Manager

    Scenario: View Asset list

        Given the system has Assets
        When I log onto CryptX as Compliance Manager
        And retrieve a list of Assets
        Then the list should have all of the Assets revelant information if it is available

    Scenario: Blacklisting an Asset

        Given the system has Asset Market Capitalization for the last 7 hours
        Given the system has only WhiteListed Assets
        When I log onto CryptX as Compliance Manager
        And I provide a rationale
        And I Blacklist an Asset
        Then a new Asset Status Change entry is save to the database with the correct type
        And the rationale I provided is saved
        And I am assigned to the Status Change
        And I can see the new status and history by getting the Asset details
        But I cannot Blacklist an Asset which is already Blacklisted