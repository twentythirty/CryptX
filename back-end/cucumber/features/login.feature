Feature: Login


   As a new user of the CryptX system, I should start by logging into the system
   Using the default Admin user.

   Scenario: I want to login for the first time.
        
        Given I know the Admin credentials
        When I log onto CryptX as Admin
        Then I should be logged in as the Admin