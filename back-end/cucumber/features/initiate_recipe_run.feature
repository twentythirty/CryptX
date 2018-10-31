Feature: Initiate a recipe run

    Investment Manager has the ability to initiate a recipe run
    for the selected investment run.
    
    Background:
    
        Given the system has an Investment Manager
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for OKEx
        And the system has updated the Instrument Market Data
        And the system has Instrument Liquidity History for the last 2 days

    #@limit_to_MVP_exchanges    
    Scenario: Initiating a recipe run for an initiated investment run
    
        Given the system has Asset Market Capitalization for the last 2 hours
        And the system has updated the Market History Calculation
        And there is a LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        When I log onto CryptX as Investment Manager
        And I initiate a new Recipe Run
        Then the system creates a new Recipe Run with status Pending
        And I am assigned to the Recipe Run as the creator
        And a Recipe Run Detail is created for each Whitelisted Asset in Asset Mix
        And the investment amounts are divided accordingly between each Recipe Detail
        And the investment percentage is divided equally between Recipe Details
        And the correct Exchange is assigned to each Detail
        But the system won't allow me to initiate another Recipe Run for this Investment

    #@limit_to_MVP_exchanges
    Scenario Outline: The system does not have base asset prices in USD for the past <amount> <interval_type> 
  
        Given there is a LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        But the system is missing base Asset prices in USD for the last <amount> <interval_type>
        When I log onto CryptX as Investment Manager
        And I initiate a new Recipe Run
        Then the system will display an error about the Market Data not being up to date
        And a new Recipe Run is not created

    Examples:
    | amount | interval_type |
    | 15  | minutes |

    #@limit_to_MVP_exchanges
    Scenario: Instrument exchange mappings are missing for base assets.
  
        Given there is a LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        But the system is missing Instrument Exchange Mappings from quote asset USD or USDT into base assets
        When I log onto CryptX as Investment Manager
        And I initiate a new Recipe Run
        Then the system will display an error about missing Instrument Mappings
        And a new Recipe Run is not created

    #@limit_to_MVP_exchanges
    Scenario: Attempting to initiate multiple recipe runs

        Given the system has Asset Market Capitalization for the last 2 hours
        And the system has updated the Market History Calculation
        And there is a LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        When I log onto CryptX as Investment Manager
        And I trigger "start recipe run" action multiple times concurrently
        Then only one or no Recipe Runs will be saved to the database