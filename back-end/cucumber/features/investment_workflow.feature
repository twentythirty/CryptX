
Feature: Investment workflow


    In order to keep track of previous and currently ongoing investment cycles,
    As the Investment Manager in CryptX
    I want to retrieve an overview of all conducted investment cycles

    Background: 

        Given the system has an Investment Manager

    Scenario: New MCI investment run.
    
        Given there are no incomplete non simulated investment runs
        When I log onto CryptX as Investment Manager
        When I create a new real MCI Investment Run
        Then the investment run information is saved to the database
        And the investment run status is Initiated
        And I am assigned as the user who created it
        But I can only create one real running investment run at the same time