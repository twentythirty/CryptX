Feature: View instrument details

   View detailed information of selected instrument

    Background:

		Given the system has an Investment Manager

	Scenario: view details for not connected instrument

		Given there is an instrument with transaction asset "Tokugawa" and quote asset "Dogecoin"
		And the instrument doesnt have any exchange mappings
		When I log onto CryptX as Investment Manager
		And view details of this instrument
		Then I see data layout:
			| symbol 	| exchanges_connected  | exchanges_failed  |
			| TOK/DOGE  | 0 		 	 	   | 0 				   |


	Scenario: view details for instrument with some failed and some success
		Given there is an instrument with transaction asset "Tokugawa" and quote asset "Dogecoin"
		And the instrument has exchange mappings on Binance, Huobi, Bitfinex
		And fetching market data with ask 0.5 on instrument has worked for Binance, Bitfinex
		But fetching market data with ask 0.5 on instrument has failed for Huobi
		When I log onto CryptX as Investment Manager
		And view details of this instrument
		Then I see data layout:
			| symbol 	| exchanges_connected  | exchanges_failed  |
			| TOK/DOGE  | 2 		 	 	   | 1 				   |
		Then I view mappings details of this instrument
		And The last update of Huobi mappings is older than fail threshold 