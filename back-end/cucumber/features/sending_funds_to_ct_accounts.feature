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

    @order_group_cache_cleanup
    Scenario: failing to withdraw if the wallet balance is 0

        And the system has 1 Approved Cold Storage Transfer for 7 XRP
        And the current balances on the exchanges are:
        | exchange  |   BTC     |   XRP     |   ETH     |
        | Bitfinex  |   1.9       |   0    |   10       |
        When the system finished the task "withdraw approved transfers"
        Then XRP Cold Storage Transfer status will be Failed
        And an error log entry about empty balance is saved

    @order_group_cache_cleanup
    Scenario: withdrawing only approved transfers.

        Given the system has 1 Pending Cold Storage Transfer for 10 XRP
        And the system has 1 Approved Cold Storage Transfer for 2 BTC
        And the system has 1 Sent Cold Storage Transfer for 55 ETH
        And the current balances on the exchanges are:
        | exchange  |   BTC     |   XRP     |   ETH     |
        | Bitfinex  |   1.9       |   10    |   0       |
        And the current withdraw fees on the exchanges are:
        | exchange  |   BTC     |   XRP     |   ETH     |
        | Bitfinex  |   0.1       |   0.5    |   0.08       |
        When the system finished the task "withdraw approved transfers"
        Then XRP and ETH Cold Storage Transfers will remain unchanged
        And BTC Cold Storage Transfer status will be Sent 
        And BTC Cold Storage Transfer will have the placed timestamp set
        And BTC Cold Storage Transfer will have the external identifier set
        And BTC Cold Storage Transfer will have the fee set to 0.1
        And BTC Cold Storage Transfer will have the amount set to 1.9
        And a log entry about amount adjustemt due to account balance will be saved
        