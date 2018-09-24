Feature: Initiate an investment run

    CryptX allows to create investment runs for a certain pre-defined strategy
    in case there is no unfinished previously started investment run in the system.

    Background: 

        Given the system has an Investment Manager
        And the system has Asset Market Capitalization for the last 2 hours

    Scenario Outline: new <strategy_type> Investment Run

        Given there are no Executing Investment Runs in the system
        When I log onto CryptX as Investment Manager
        And I select to create a new <strategy_type> Investment Run
        And I generate a new <strategy_type> strategy Asset Mix
        And I enter the investment amounts in USD, BTC and ETH
        And I confirm the new Investment Run
        Then a new Investment Run is created with the status Initiated
        And I am assigned to it as the creator
        And the entered investment amounts are saved along with it
        And the Asset Mix is assigned to it with appropriate <strategy_type> assets
        But the system will not allow me to create another Investment Run

    Examples:
        | strategy_type |
        | LCI  |
        | MCI    |

    Scenario Outline: Investment run cannot be initiated with invalid values
  
        Given there are no Executing Investment Runs in the system
        When I log onto CryptX as Investment Manager
        But I attempt to create a new Investment Run with invalid values: <strategy_type>, <is_simulated>, <investment_amounts>
        Then the system will display Investment Run validation error
        And the system does not create a new Investment Run

    Examples: 
        | strategy_type | is_simulated | deposit_amounts |
        | SCI | false | USD=1000,BTC=1,ETH=10 |
        | MCI | dogs | USD=1000,BTC=1,ETH=10 |
        | MCI | false | XRP=101 |
        | MCI | false |  |
        | MCI | false | USD=-1 |