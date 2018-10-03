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