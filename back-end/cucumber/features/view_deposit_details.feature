Feature: view deposit details

   View details associated with system deposits, including state changes

   Background:

		Given the system has a Investment Manager
        And the system has a Trader
        And the system has a Depositor
        And the system has Instrument Mappings for Binance
        And the system has updated the Instrument Market Data
        And the system has Exchange Account for BTC on Binance
        And the system has Exchange Account for ETH on Binance
		And the system has Asset Market Capitalization for the last 2 hours
        And there is a LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details

	@investment_run_cache_cleanup
	Scenario: view generated deposit

		Given the system has one recipe run deposit with status Pending
		When I log onto CryptX as Depositor
		And navigate to Pending recipe run deposit
		And view details of this recipe run deposit
		Then the view detail quote asset is BTC or ETH
		And the view detail exchange is Binance
		And the view detail status is Pending
		And the view detail deposit management fee is unknown
		And the view detail depositor user is unknown
		And there are no deposit log entries

	@investment_run_cache_cleanup
	Scenario: view generated deposit

		Given the system has one recipe run deposit with status Pending
		When I log onto CryptX as Depositor
		And navigate to Pending recipe run deposit
		And confirm recipe run deposit with amount 1.5 and fee 0.5
		And view details of this recipe run deposit
		Then the view detail quote asset is BTC or ETH
		And the view detail exchange is Binance
		And the view detail status is Pending
		And the view detail deposit management fee is 0.5
		And the view detail depositor user is unknown
		And the view detail amount is 1.5
		And there is a log of this Amount for this deposit
		And there is a log of this Fee for this deposit
		And I can adjust both values again
		
