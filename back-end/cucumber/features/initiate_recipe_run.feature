Feature: Initiate a recipe run

    Investment Manager has the ability to initiate a recipe run
    for the selected investment run.

    Background:
    
        Given the system has an Investment Manager
        And the system has Instrument Mappings for Kraken
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitstamp
        And the system has Instrument Mappings for Bittrex
        And the system has Instrument Mappings for HitBTC
        And the system has Instrument Mappings for Huobi
        And the system has updated the Instrument Market Data
        And the system has Instrument Liquidity History for the last 2 days
        
    Scenario: Initiating a recipe run for an initiated investment run
    
        Given the system has Asset Market Capitalization for the last 2 hours
        Given the system has updated the Market History Calculation
        And there is a real LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        When I log onto CryptX as Investment Manager
        And I iniatiate a new Recipe Run
        Then the system creates a new Recipe Run with status Pending
        And I am assigned to the Recipe Run as the creator
        And a Recipe Run Detail is created for each Whitelisted Asset in Asset Mix
        And the investment is spread accordingly between each Recipe Detail
        And the investment percentage is divided equally between Recipe Details
        And the correct Exchange is assigned to each Detail
        But the system won't allow me to initiate another Recipe Run for this Investment

    Scenario Outline: The system does not have base asset prices in USD for the past <amount> <interval_type> 
  
        And there is a real LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        But the system is missing base Asset prices in USD for the last <amount> <interval_type>
        When I log onto CryptX as Investment Manager
        And I iniatiate a new Recipe Run
        Then the system will display an error about the Capitalization not bring up to date
        And a new Recipe Run is not created

    Examples:
    | amount | interval_type |
    | 15  | minutes |

    Scenario: Instrument exchange mappings are missing for base assets.
  
        And there is a real LCI Investment Run created by an Investment Manager
        And the status of the Investment Run is Initiated
        And the Investment Run has no Recipe Runs
        But the system is missing Instrument Exchange Mappings for base assets in USD or USDT
        When I log onto CryptX as Investment Manager
        And I iniatiate a new Recipe Run
        Then the system will display an error about missing Instrument Mappings
        And a new Recipe Run is not created
