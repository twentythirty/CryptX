Feature: Retireving cold storage transfer status from exchanges

    Job will poll the exchanges and check for updates in the status of the withdraw

    Background: 

        Given there are no Cold Storage Transfers in the system
        And the system has 5 Cold Storage Custodians
        And the system has Instrument Mappings for Bitfinex
        And the system has Recipe Order with status Completed on Bitfinex
        And the system has LCI Cold Storage Account for ETH

    Scenario: retrieving withdrawal information which is still being processed on the exchange.

        Given the system has 1 Approved Cold Storage Transfer for ETH
        And the ETH Cold Storage Transfer has a withdraw request on Bitfinex
        And the status of the withdrawal on the exchange is pending
        When the system finished the task "transfer status updater"
        Then ETH Cold Storage Transfer will have status Sent
        And ETH Cold Storage Transfer will have the fee set