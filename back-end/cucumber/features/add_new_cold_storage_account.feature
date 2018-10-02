Feature: Add a new cold storage account

    Users can add cold storage account to store crypto currency

    Background:

        Given the system has an Investment Manager
        And the system has 2 Cold Storage Custodians

    Scenario: successfully adding a new cold storage account

        Given there are no Cold Storage Accounts in the system
        When I log onto CryptX as Investment Manager
        And I select a Cold Storage Custodian
        And I select a cryptocurrency Asset
        And I create a new LCI Cold Storage Account
        Then a new Cold Storage Account is saved to the database
        And the selected Asset and Custodian is assigned to it
        But I can only add one Cold Storage Account with the same address