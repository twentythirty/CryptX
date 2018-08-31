Feature: Login


   As a new user of the CryptX system, I should start by logging into the system
   Using the default Admin user.

   Scenario: I want to login for the first time.
        
        Given I know the Admin credentials
        When When I attempt to login with the default Admin credentials
        Then I should be logged in as the Admin