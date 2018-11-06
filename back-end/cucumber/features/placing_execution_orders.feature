Feature: execution order placement on exchanges

    The system will periodically attempt to automatically place pending execution orders on exchanges

    @execution_orders_cache_cleanup
    Scenario: place execution orders on exchange

        Given the system has execution orders with status Pending
        When the system finished the task "place execution orders on exchanges"
        Then all the execution orders will have status InProgress
        And all the execution orders will have external identifiers
        And this action was logged with execution order id

    @execution_orders_cache_cleanup
    Scenario: fail to place execution order on exchange first time

        Given the system has execution orders with status Pending
        And the execution orders failed attempts count is a lot less than system failure cap
        When the system finished the task "place execution orders on exchanges"
        Then all the execution orders will have status Pending
        And all the execution orders failed attempts is incremented by 1
        And all the execution orders won't have external identifiers

    @execution_orders_cache_cleanup
    Scenario: fail to place execution order on exchange last time

        Given the system has execution orders with status Pending
        And the execution orders failed attempts count is just below system failure cap
        When the system finished the task "place execution orders on exchanges"
        Then all the execution orders will have status Failed
        And all the execution orders failed attempts is incremented by 1
        And all the execution orders won't have external identifiers
        And this action was logged with execution order id