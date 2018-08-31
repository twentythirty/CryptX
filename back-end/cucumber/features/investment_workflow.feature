
Feature: Investment workflow


    In order to keep track of previous and currently ongoing investment cycles,
    As the Investment Manager in CryptX
    I want to retrieve an overview of all conducted investment cycles

    Background: 

        Given The system has an Investment Manager

    @user_cleanup
    Scenario: Investment dashboard.
    
        Given some investment runs have been completed and there are currently ongoing ones
        When I log onto CryptX as Investment Manager
        And I navigate to the investment dashboard
        Then I can see an overview of all previously completed investment runs with their status
        And currently ongoing ones with their status
        And upon selecting a specific one I can retrieve all the details pertaining to the specific investment run, such as approved recipe and order details