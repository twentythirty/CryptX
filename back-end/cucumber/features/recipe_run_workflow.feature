Feature: Recipe run workflow



   INCOMPLETE: There will be changes to the investment run and recipe run soon.


   Background:

        Given the system has an Investment Manager

    Scenario: New Recipe Run

        Given there is a real MCI Investment Run created by an Investment Manager
        And the current Investment Run has no recipe runs
        And the status of the Investment Run is Initiated
        When I log onto CryptX as Investment Manager
