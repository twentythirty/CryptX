Feature: Confirm anew cold storage transfer

    Users can confirm pending cold storage transfers

    Background:

        Given the system has an Investment Manager
        And the system has 2 Cold Storage Custodians
        And the system has LCI Cold Storage Account for XRP

    Scenario: confirming a pending cold storage transfer

        Given the system has 1 Pending Cold Storage Transfer for XRP
        When I log onto CryptX as Investment Manager
        And I select a Pending Cold Storage Transfer
        And I approve the Pending Cold Storage Transfer
        Then the Cold Storage Transfer will have status Approved
        And this action was logged with Cold Storage Transfer ID
        But I can only approve Cold Storage Transfers with status Pending

    Scenario Outline: attempting to confirm a <status> cold storage transfer

        Given the system has 1 <status> Cold Storage Transfer for XRP
        When I log onto CryptX as Investment Manager
        And I select a <status> Cold Storage Transfer
        And I approve the <status> Cold Storage Transfer
        Then I will see an error about approving a non Pending Cold Storage Transfer

    Examples:
    |   status      |
    |   Approved    |
    |   Sent        |
    |   Failed      |
    |   Canceled    |
    |   Completed   |