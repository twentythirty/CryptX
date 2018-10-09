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
        Then I will see the timeline:
        | info  | investment_run    | recipe_run    | recipe_deposits   | recipe_orders | execution_orders  |
        | status | Initiated    | Recipe runs are not created yet   |  Deposits are not created yet | Orders are not created yet    |  Execution orders are not created yet |  
        | amount |   -   |   -   |   -   |   -   |   -   |
        | time    | Thu Oct 04 2018 11:55:35 |   -   |   -   |   -   |   -   |
        | strategy  | LCI   |   -   |   -   |   -   |   -   |
    