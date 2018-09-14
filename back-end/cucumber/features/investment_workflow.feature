
Feature: Investment workflow


    In order to keep track of previous and currently ongoing investment cycles,
    As the Investment Manager in CryptX
    I want to retrieve an overview of all conducted investment cycles

    Background: 

        Given the system has an Investment Manager
        Given the system has a Depositor
        Given the system has a Trader

    Scenario: New MCI investment run.
    
        Given there are no incomplete non simulated investment runs
        When I log onto CryptX as Investment Manager
        And I generate a new MCI Asset Mix
        And I create a new real MCI Investment Run
        Then the Investment Run information is saved to the database
        And the Investment Run status is Initiated
        And I am assigned as the user who created it
        But I can only create one real running investment run at the same time

    Scenario: View an existing investment run.

        Given there is a real LCI Investment Run created by an Investment Manager
        When I log onto CryptX as Investment Manager
        And I get the Investment Run by id
        Then I should see the Investment Run information
        And the creators full name should match

    Scenario: New simulated investment run.

        Given there is a real MCI Investment Run created by an Investment Manager
        When I log onto CryptX as Investment Manager
        And I generate a new MCI Asset Mix
        And I create a new simulated MCI Investment Run
        Then the Investment Run information is saved to the database
        And the Investment Run should be marked as simulated

    Scenario Outline: <unauth_role> tries to create a new investment run

        Given there are no investment runs in the system
        When I log onto CryptX as <unauth_role>
        And I generate a new MCI Asset Mix
        Then I should be blocked by the system for not having the right permissions

    Examples:
    | unauth_role |
    | Depositor  |
    | Trader    |
