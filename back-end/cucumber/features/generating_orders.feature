Feature: Generating Orders

    Ability to generate new orders for recipe runs.

    Background: 

        Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Instrument Mappings for Kraken
        And the system has updated the Instrument Market Data
        And there is a real LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details
        And the system has Exchange Account for BTC on Kraken
        And the system has Exchange Account for ETH on Kraken

    Scenario: Correct order generation when all of the conditions are met

        Given the system has Completed Deposits
        And the system does not have none rejected Orders
        When I log onto CryptX as Trader
        And I call the API to generate Orders for the Approved Recipe Run
        Then the server return a successful response
        And a new Recipe Group is created with the status Pending
        And a Recipe Order is created for each Recipe Run Detail
        And the Recipe Orders have the status Pending
        And the Investment Run will have status OrdersGenerated
        But the system won't allow me to generate Recipe Orders while this group is not Rejected

    Scenario: Order generation when Deposits are not completed

        Given the system has Pending Deposits
        And the system does not have none rejected Orders
        When I log onto CryptX as Trader
        And I call the API to generate Orders for the Approved Recipe Run
        Then the server return a failed response
        And I should see an error message describing that there are Pending Deposits




        