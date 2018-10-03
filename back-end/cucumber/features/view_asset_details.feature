Feature: View asset details

   View detailed information on a specific system asset. This also includes blacklisting/whitelisting logs.

	Background:

		Given the system has an Investment Manager
		And there is a crypto asset called "Tokugawa" with the symbol "TOK"
		And the asset has no status change history
		And the asset has no known capitalization
		And the asset has no known market history calculations

	Scenario: view asset details without any status change history
		Given the asset had capitalization of 10000 USD and market share of 2.5% recorded on 2018-05-05
		And the asset had NVT value of 0.005 calculated
		When I log onto CryptX as Investment Manager
		And view details of this asset
		Then I see data layout:
			| symbol | is_cryptocurrency | long_name | is_base | is_deposit | capitalization | nvt_ratio | market_share | capitalization_updated   | status 	 |
			| TOK	 | Yes				 | Tokugawa	 | No 	   | No 		| 10000			 | 0.005	 | 2.5			| 2018-05-05T00:00:00.000Z | Whitelisted |