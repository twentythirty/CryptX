Feature: Invitation

    I can login and become a CryptX user once I process the Invitation

    Background: 

        Given the system has invited a new user

    @user_cleanup
    Scenario: Process Invitation

        When I follow the valid invitation link
        And I input my new password
        Then my user is ready for use
        And I am logged in to the system
