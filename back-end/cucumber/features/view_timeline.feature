Feature: View the timeline of an investment run process

    The time line is diffenent base on the current investment run status

    Background:

        Given the system has an Investment Manager
        And the system has an Depositor
        And the system has a Trader
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for OKEx
        And the system has Instrument Mappings for Bitfinex

    Scenario: view timeline of an investment run with status "initiated"

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is Initiated
        When I log onto CryptX as Investment Manager
        And I fetch the timeline of the current Investment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Initiated   |   Thu Oct 04 2018 11:55:35    |   LCI |
        And in the Recipe Run timeline card, I will see the following information:
        |   status  |
        |   Recipe runs are not created yet   |
        And in the Recipe Deposits timeline card, I will see the following information:
        |   status  |
        |   Deposits are not created yet   |
        And in the Recipe Orders timeline card, I will see the following information:
        |   status  |
        |   Orders are not created yet   |
        And in the Execution Orders timeline card, I will see the following information:
        |   status  |
        |   Execution orders are not created yet   |

    Scenario: view timeline of an investment run with status "recipe run"

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is RecipeRun
        And the system has Pending Recipe Run with Details
        And the Recipe Run was created on Thu, 04 Oct 2018 14:20:10
        When I log onto CryptX as Investment Manager
        And I fetch the timeline of the current Investment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Recipe Run   |   Thu Oct 04 2018 11:55:35    |   LCI |
        And in the Recipe Run timeline card, I will see the following information:
        |   status  |   time    |
        |   Pending   |     Thu Oct 04 2018 14:20:10    |
        And in the Recipe Deposits timeline card, I will see the following information:
        |   status  |
        |   Deposits are not created yet   |
        And in the Recipe Orders timeline card, I will see the following information:
        |   status  |
        |   Orders are not created yet   |
        And in the Execution Orders timeline card, I will see the following information:
        |   status  |
        |   Execution orders are not created yet   |

    Scenario: view timeline of an investment run with status "recipe approved" and pending deposits

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is RecipeApproved
        And the system has Approved Recipe Run with Details
        And the Recipe Run was created on Thu, 04 Oct 2018 14:20:10
        And the system has 8 Pending Deposits
        And the system has 2 Completed Deposits
        When I log onto CryptX as Investment Manager
        And I fetch the timeline of the current Investment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Recipe Approved   |   Thu Oct 04 2018 11:55:35    |   LCI |
        And in the Recipe Run timeline card, I will see the following information:
        |   status  |   time    |
        |   Approved   |     Thu Oct 04 2018 14:20:10    |
        And in the Recipe Deposits timeline card, I will see the following information:
        |   status  |   amount   |
        |   Pending   |     10    |
        And in the Recipe Orders timeline card, I will see the following information:
        |   status  |
        |   Orders are not created yet   |
        And in the Execution Orders timeline card, I will see the following information:
        |   status  |
        |   Execution orders are not created yet   |

    Scenario: view timeline of an investment run with status "orders generated"

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is OrdersGenerated
        And the system has Approved Recipe Run with Details
        And the Recipe Run was created on Thu, 04 Oct 2018 14:20:10
        And the system has 10 Completed Deposits
        And the system has Pending Recipe Order Group with 42 Orders
        When I log onto CryptX as Investment Manager
        And I fetch the timeline of the current Investment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Orders Generated   |   Thu Oct 04 2018 11:55:35    |   LCI |
        And in the Recipe Run timeline card, I will see the following information:
        |   status  |   time    |
        |   Approved   |     Thu Oct 04 2018 14:20:10    |
        And in the Recipe Deposits timeline card, I will see the following information:
        |   status  |   amount   |
        |   Completed   |     10    |
        And in the Recipe Orders timeline card, I will see the following information:
        |   status  |   amount  |
        |   Pending   | 42      |
        And in the Execution Orders timeline card, I will see the following information:
        |   status  |
        |   Execution orders are not created yet   |

    Scenario: view timeline of an investment run with status "orders executing"

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is OrdersExecuting
        And the system has Approved Recipe Run with Details
        And the Recipe Run was created on Thu, 04 Oct 2018 14:20:10
        And the system has 10 Completed Deposits
        And the system has Approved Recipe Order Group with 42 Orders
        And there are 38 InProgress Execution Orders for Binance
        And there are 45 InProgress Execution Orders for OKEx
        And there are 8 FullyFilled Execution Orders for Bitfinex
        When I log onto CryptX as Investment Manager
        And I fetch the timeline of the current Investment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Orders Executing   |   Thu Oct 04 2018 11:55:35    |   LCI |
        And in the Recipe Run timeline card, I will see the following information:
        |   status  |   time    |
        |   Approved   |     Thu Oct 04 2018 14:20:10    |
        And in the Recipe Deposits timeline card, I will see the following information:
        |   status  |   amount   |
        |   Completed   |     10    |
        And in the Recipe Orders timeline card, I will see the following information:
        |   status  |   amount  |
        |   Executing   | 42      |
        And in the Execution Orders timeline card, I will see the following information:
        |   status  |   amount  |
        |   In Progress   | 91  |

    Scenario: view timeline of an investment run with status "orders filled"

        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the status of the Investment Run is OrdersFilled
        And the system has Approved Recipe Run with Details
        And the Recipe Run was created on Thu, 04 Oct 2018 14:20:10
        And the system has 10 Completed Deposits
        And the system has Approved Recipe Order Group with 42 Orders
        And there are 38 FullyFilled Execution Orders for Binance
        And there are 45 FullyFilled Execution Orders for OKEx
        And there are 8 FullyFilled Execution Orders for Bitfinex
        And the Recipe Orders statuses were updated
        When I log onto CryptX as Investment Manager
        And I fetch the timeline of the current Investment Run
        Then in the Investment Run timeline card, I will see the following information:
        |   status  |   time    |   strategy    |
        |   Orders Filled   |   Thu Oct 04 2018 11:55:35    |   LCI |
        And in the Recipe Run timeline card, I will see the following information:
        |   status  |   time    |
        |   Approved   |     Thu Oct 04 2018 14:20:10    |
        And in the Recipe Deposits timeline card, I will see the following information:
        |   status  |   amount   |
        |   Completed   |     10    |
        And in the Recipe Orders timeline card, I will see the following information:
        |   status  |   amount  |
        |   Completed   | 42      |
        And in the Execution Orders timeline card, I will see the following information:
        |   status  |   amount  |
        |   Fully Filled   | 91  |