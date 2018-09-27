Feature: Degreylist an asset

   Users have the ablitity to degreylist greylisted assets

    Background:

        Given the system has an Compliance Manager
        And the system has Asset Market Capitalization for the last 2 hours

    Scenario: successfully degreylisting an asset

        Given the system has some Greylisted Assets
        When I log onto CryptX as Compliance Manager
        And I select a Greylisted Asset
        And I provide a rationale
        And I Degreylist the Asset
        Then a new Asset Status Change entry is saved to the database with the correct type
        And the rationale I provided is saved
        And I am assigned to the Status Change
        And I can see the new status and history by getting the Asset details
        But I cannot Degreylist an Asset which is already Degreylisted