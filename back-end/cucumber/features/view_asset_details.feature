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
	
	Scenario: view asset details with asset having gone through several status changes
		Given the asset had capitalization of 15000 USD and market share of 0.5% recorded on 2018-10-01
		And the asset had NVT value of 0.0175 calculated
		And the user has Blacklisted the asset with rationale "cucumber blacklist" on 2017-07-03
		And the user has Whitelisted the asset with rationale "cucumber whitelist" on 2018-02-05
		When I log onto CryptX as Investment Manager
		And view details of this asset
		Then I see data layout:
			| symbol | is_cryptocurrency | long_name | is_base | is_deposit | capitalization | nvt_ratio | market_share | capitalization_updated   | status 	 |
			| TOK	 | Yes				 | Tokugawa	 | No 	   | No 		| 15000			 | 0.0175	 | 0.5			| 2018-10-01T00:00:00.000Z | Whitelisted |
		And I see the status change logs:
			| comment 			 | timestamp 				| type 			|
			| cucumber whitelist | 2018-02-05T00:00:00.000Z	| Whitelisted	|
			| cucumber blacklist | 2017-07-03T00:00:00.000Z	| Blacklisted	|