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