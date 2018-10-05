Feature: View cold storage accounts

   View the cold storage accoutns currently present in the system.

   Background:

		Given the system has an Investment Manager
		And there is a Cold Storage Custodian named "Cucumber Custodian"
		And there are no Cold Storage Accounts in the system

	Scenario: view cold storage accounts

		Given there is a cold storage account for Bitcoin, strategy LCI, address "c6b5751c"
		And there is a cold storage account for Ethereum, strategy MCI, address "c6b57bfc"
		When I log onto CryptX as Investment Manager
		And view list of cold storage accounts
		#originally written to also test ID column, but postgres cant reset sequence via sequelize truncate
		#so cant test ids
		Then I see data layout:
			| asset | strategy_type  | address  | custodian 		 | balance | balance_usd | balance_update_timestamp |
			| ETH   | MCI 		 	 | c6b57bfc | Cucumber Custodian | 0	   | 0			 | -			   			|
			| BTC   | LCI 		 	 | c6b5751c | Cucumber Custodian | 0	   | 0			 | -			   			|


