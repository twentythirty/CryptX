Feature: Approving Orders

    Ability to approve generated orders for recipe runs.

    Background:

        Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Instrument Mappings for Kraken
        And the system has updated the Instrument Market Data
        And the system has Exchange Account for BTC on Kraken
        And the system has Exchange Account for ETH on Kraken
        And there is a LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details
        And the system has Completed Deposits
        
    
    Scenario: approve generated orders

        Given there is a recipe order group with status Pending
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe order group
        And approve the order group with a rationale
        Then the recipe order group will have status Approved
        And all orders in the group will have status Executing
        And the investment run will have status OrdersExecuting

    Scenario: fail to approve generated orders
  
        Given there is a recipe order group with status Pending
        But one of the orders is missing their CCXT mapping
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe order group
        And approve the order group with a rationale
        Then the approval fails with an error message including mapping and exchange
        And the recipe order group status will remain unchanged
        And all orders in the group statuses will remain unchanged

    Scenario: reject generated orders
  
        Given there is a recipe order group with status Pending
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe order group
        And reject the order group with a rationale
        Then the recipe order group will have status Rejected
        And all orders in the group will have status Rejected
        And I can generate another order group
