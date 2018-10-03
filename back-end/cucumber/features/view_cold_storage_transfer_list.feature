Feature: View cold storage transfer list

    User may view a list of cold storage transfers

    Background:

        Given the system has an Investment Manager
        And the system has 5 Cold Storage Custodians
        And the system has Instrument Mappings for Bitfinex
        And the system has Exchange Account for XRP on Bitfinex
        And the system has Recipe Order with status Completed on Bitfinex
        And the system has LCI Cold Storage Account for XRP
        And the system has 3 Pending Cold Storage Transfer for XRP
        And the system has 1 Approved Cold Storage Transfer for XRP
        And the system has 2 Sent Cold Storage Transfer for XRP
        And the system has 4 Completed Cold Storage Transfer for XRP
        And the system has 1 Failed Cold Storage Transfer for XRP

    Scenario: view a list of cold storage transfers with different statuses

        When I log onto CryptX as Investment Manager
        And I retrieve the Cold Storage Transfer list
        Then Pending and Approved Transfers won't have timestamps and fee
        But Completed Transfers will have timestamps and fee
        And the net amount will be calculated by subtracting the fee from the gross amount
        And the Exchange, Address and Asset of the source account will match the Transfer
        And I will see the Custodian name based on the Cold Storage Account it is being transfered to
        And the Transfers footer will show a number of distinct Assets and Exchanges
        And the Transfers footer will show a number of Pending Transfers



