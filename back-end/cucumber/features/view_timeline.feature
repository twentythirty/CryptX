Feature: View the timeline of an investment run process

    The time line is diffenent base on the current investment run status

    Background:

        Given the system has an Investment Manager

    Scenario: view timeline of an invetsment run with status initiated

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is Initiated
        When I log onto CryptX as InvestmentManager
        And I fetch the timeline of the current Invetsment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Initiated   |   Thu Oct 04 2018 11:55:35    |   LCI |
        Then in the Recipe Run timeline card, I will see the following information:
        |   status  |
        |   Recipe runs are not created yet   |
        Then in the Recipe Deposits timeline card, I will see the following information:
        |   status  |
        |   Deposits are not created yet   |
        Then in the Recipe Orders timeline card, I will see the following information:
        |   status  |
        |   Orders are not created yet   |
        Then in the Execution Orders timeline card, I will see the following information:
        |   status  |
        |   Execution orders are not created yet   |