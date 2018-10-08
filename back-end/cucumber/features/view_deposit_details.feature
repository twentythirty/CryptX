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
        And there is a LCI Investment Run created by an Investment Manager
        And the system has Approved Recipe Run with Details

	@investment_run_cache_cleanup
	Scenario: view generated deposit

		Given the system has some recipe run deposits with status Pending
		When I log onto CryptX as Depositor
		And navigate to Pending recipe run deposit
		And view details of this recipe run deposit
		Then I see data layout:
			| quote_asset | exchange | status  |
			| BTC		  | Binance  | Pending |