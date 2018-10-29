Feature: Sending funds to cold storage accounts

    Approved transfers should result in a withdraw of funds to cold storage accounts.

    Background: 

        Given there are no Cold Storage Transfers in the system
        And the system has 5 Cold Storage Custodians
        And the system has Instrument Mappings for Bitfinex
        And the system has Exchange Account for XRP on Bitfinex
        And the system has Recipe Order with status Completed on Bitfinex
        And the system has LCI Cold Storage Account for XRP
        And the system has LCI Cold Storage Account for BTC
        And the system has LCI Cold Storage Account for ETH

    Scenario: withdrawing only approved transfers.

        Given the system has 1 Pending Cold Storage Transfer for XRP
        And the system has 1 Approved Cold Storage Transfer for BTC
        And the system has 1 Sent Cold Storage Transfer for ETH
        When the system finished the task "withdraw approved transfers"
        Then XRP and ETH Cold Storage Transfers will remain unchanged
        And BTC Cold Storage Transfer status will be Sent 
        And BTC Cold Storage Transfer will have the placed timestamp set
        And BTC Cold Storage Transfer will have the external identifier set
