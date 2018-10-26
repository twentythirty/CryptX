Feature: Approving Recipe Run

    Ability to approve generated recipe run for a given investment run.

    Background:

        Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Asset Market Capitalization for the last 2 hours
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for OKEx
        And the system has updated the Instrument Market Data
        And there is a LCI Investment Run created by an Investment Manager

    @investment_run_cache_cleanup
    Scenario: reject a pending recipe run
    
        Given there is a recipe run with status Pending
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe run
        And reject recipe run with provided rationale
        Then the recipe run will have status Rejected
        And the recipe run will have no conversions
        And the investment run status will remain unchanged

    @investment_run_cache_cleanup
    Scenario: confirm a pending recipe run with errors
  
        Given there is a recipe run with status Pending
        But at least one recipe run detail is missing an exchange instrument mapping
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe run
        And approve recipe run with provided rationale
        Then the recipe run status will remain unchanged
        And the recipe run will have no conversions
        And the system will show a detailed error including missing mappings

    Scenario: confirm a pending recipe run
  
        Given there is a recipe run with status Pending
        And there are Cold Storage Accounts required for the Recipe Run
        When I log onto CryptX as Investment Manager
        And navigate to Pending recipe run
        And approve recipe run with provided rationale
        Then the recipe run will have status Approved
        And the recipe run will have conversions generated
        And all the recipe run conversions will have status Pending
        And the investment run will have status RecipeApproved