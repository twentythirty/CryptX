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
        But I can only add one Cold Storage Account with the same strategy, asset and custodian

    Scenario: attempting to add a cold storage account for a non-cryptocurrency asset

        Given there are no Cold Storage Accounts in the system
        When I log onto CryptX as Investment Manager
        And I select a Cold Storage Custodian
        And I select a non-cryptocurrency Asset
        And I create a new LCI Cold Storage Account
        Then the system will display an error about using a non-cryptocurrency asset
        And a new Cold Storage Account is not created
        
    #Scenario: editing the address and tag of an existing account

        #Given the system has LCI Cold Storage Account for ETH
        #When I log onto CryptX as Investment Manager
        #And I edit the Account with new values:
        #|   address     |   tag         |
        #|   A6mL1I8J1x  |   ETH-TEST    |
        #Then the Cold Storage Account address will be "A6mL1I8J1x"
        #And the Cold Storage Account tag will be "ETH-TEST"
        #But the Cold Storage Account asset, strategy and custodian will remain unchanged