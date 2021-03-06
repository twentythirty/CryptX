Feature: Complete Deposits

	I can complete prepared system deposits once I provide the correct values

	Background:

		Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Instrument Mappings for Binance
        And the system has updated the Instrument Market Data
        And the system has Exchange Account for BTC on Binance
        And the system has Exchange Account for ETH on Binance
        And there is a LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details

	@investment_run_cache_cleanup
	Scenario: complete last deposit successfully

		Given the system has one recipe run deposit with status Pending
		When I log onto CryptX as Depositor
		And navigate to Pending recipe run deposit
		And confirm recipe run deposit with provided amount and fee
		And approve recipe run deposit
		Then the recipe run deposit will have status Completed
		And this action was logged with recipe run deposit id
		And the investment run will have status DepositsCompleted
  
  	@investment_run_cache_cleanup
	Scenario Outline: fail to confirm deposit
	
		Given the system has one recipe run deposit with status Pending
		But the recipe run deposit has amount <amount> and fee <fee>
		When I log onto CryptX as Depositor
		And navigate to Pending recipe run deposit
		And approve recipe run deposit
		Then the system will report error with bad values
		And the recipe run deposit status will remain unchanged
	
	Examples:
		| amount | fee |
		| -1000 | 0 |
		| 0 | 5 |
		| 34 | -5 |
  
	@investment_run_cache_cleanup
	Scenario: fail to confirm deposit with status completed
	
		Given the system has one recipe run deposit with valid amount and fee
		But the recipe run deposit has status Completed
		When I log onto CryptX as Depositor
		And navigate to Completed recipe run deposit
		And approve recipe run deposit
		Then the recipe run deposit status will remain unchanged
		And the system will report error related to status

	@investment_run_cache_cleanup
	Scenario: complete deposit successfully
  
		Given the system has some recipe run deposits with status Pending
		When I log onto CryptX as Depositor
		And navigate to Pending recipe run deposit
		And confirm recipe run deposit with provided amount and fee
		And approve recipe run deposit 
		Then the recipe run deposit will have status Completed
		And this action was logged with recipe run deposit id
		And the investment run status will remain unchanged