const { Given, When, Then, AfterAll, After } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

const users = {
    investment_manager: {
        first_name: 'Investment',
        last_name: 'Manager',
        email: 'investment.manager@cryptx.io',
        password: '123',
        is_active: true,
        created_timestamp: new Date(),
        role: {
            name: 'INVESTMENT MANAGER'
        }
    },
    depositor: {
        first_name: 'Depositor',
        last_name: 'Johnson',
        email: 'depositor@cryptx.io',
        password: '123',
        is_active: true,
        created_timestamp: new Date(),
        role: {
            name: 'DEPOSITOR'
        }
    },
    trader: {
        first_name: 'Trader',
        last_name: 'Grant',
        email: 'trader@cryptx.io',
        password: '123',
        is_active: true,
        created_timestamp: new Date(),
        role: {
            name: 'TRADER'
        }
    },
    compliance_manager: {
        first_name: 'Compliance Manager',
        last_name: 'Steve',
        email: 'compliance.manager@cryptx.io',
        password: '123',
        is_active: true,
        created_timestamp: new Date(),
        role: {
            name: 'COMPLIANCE MANAGER'
        }
    },
    invited_user: {
        first_name: 'Wallace',
        last_name: 'Kasinsky',
        email: 'wallace.kasinsky@cryptx.io',
        password: null,
        is_active: true,
        created_timestamp: new Date()
    }
};

Given('the system has no users', function() {

    const { User, sequelize } = require('../../../models');
    const Op = sequelize.Op;

    return User.destroy({
        where: {
            email: { [Op.ne]: process.env.ADMIN_EMAIL } //Let's not delete the Default admin
        }
    });

});

Given('the system has invited a new user', async function() {
    const User = require('../../../models').User;
    const Role = require('../../../models').Role;
    //erase invited user if present, 
    //since invitation is supposed to be valid by default
    await User.destroy({
        where: {
            email: users.invited_user.email
        }
    })

    //always present admin
    const admin = await User.findOne({
        where: {
            email: process.env.ADMIN_EMAIL
        }
    })
    //whatever role comes up
    const any_role = await Role.findOne()

    const [user, invitation] = await this.invitationService.createUserAndInvitation(
        admin,
        [any_role.id], 
        users.invited_user.first_name,
        users.invited_user.last_name,
        users.invited_user.email
    );

    this.invitation = invitation;
    this.invited_user = user;
});

Given(/^the system has (a|an) (.*)$/, async function(a, role_name) {

    const user_data = users[_.snakeCase(role_name)];

    if(!user_data) throw new Error(`Invalid role "${role_name}" in test`);

    const permisisons_categoriy_mapping = {
        investment_manager: [PERMISSIONS_CATEGORIES.INVESTMENT_RUN, PERMISSIONS_CATEGORIES.RECIPE_RUN, PERMISSIONS_CATEGORIES.OTHER],
        depositor: [PERMISSIONS_CATEGORIES.INSTRUMENTS],
        trader: [PERMISSIONS_CATEGORIES.ORDERS],
        compliance_manager: [PERMISSIONS_CATEGORIES.OTHER, PERMISSIONS_CATEGORIES.INSTRUMENTS]
    };

    const { User, Role, Permission, PermissionsCategory, sequelize } = require('../../../models');

    if(!World.users) World.users = {};

    const existing_user = await User.findOne({
        where: { email: user_data.email }
    });

    if(existing_user) {
        if(World.users[_.snakeCase(role_name)]) return;

        //Make sure that user is up to date.
        ['first_name', 'last_name', 'password', 'is_active'].map(field => {
            existing_user[field] = user_data[field];
        });

        return sequelize.transaction(transaction => {
            return existing_user.save({ transaction }).then(user => {
                user.unhashed_password = user_data.password;
                World.users[_.snakeCase(role_name)] = user;
                return PermissionsCategory.findAll({
                    where: { name: permisisons_categoriy_mapping[_.snakeCase(role_name)] },
                    raw: true,
                    transaction
                }).then(permisisons_categories => {
                    return Permission.findAll({
                        where: { category_id: permisisons_categories.map(p => p.id) },
                        transaction
                    }).then(permissions => {
                        return Role.findOrCreate({
                            where: { name: user_data.role.name },
                            transaction
                        }).then(([role, created]) => {
                            return role.setPermissions(permissions, { transaction }).then(() => {
                                return user.setRoles([role], { transaction })
                            })
                        })
                    });
                })

            })
        });
    }

    return sequelize.transaction(transaction => {
        return PermissionsCategory.findAll({
            where: { name: permisisons_categoriy_mapping[_.snakeCase(role_name)] },
            raw: true,
            transaction
        }).then(permisisons_categories => {
            return Permission.findAll({
                where: { category_id: permisisons_categories.map(p => p.id) },
                transaction
            }).then(permissions => {
                return Role.create(user_data.role, { transaction })
                    .then(role => {
                        user_data.role.id = role.id;
                        return role.setPermissions(permissions, { transaction })
                            .then(() => {
                                return new User(user_data).save({ transaction })
                                    .then(user => {
                                        user_data.id = user.id;
                                        return user.setRoles([role], { transaction }).then(() => {
                                            
                                            user.unhashed_password = user_data.password;
                                            World.users[_.snakeCase(role_name)] = user;  //Save the user in the world to use in other tests
                                        });
                                    });
                            });
                    });
            });
        })
    });

});

When('I follow the valid invitation link', async function() {

    //check state valid
    chai.assert.isNotNull(this.invitation, 'Previous step should have generated a user invitation!');
    chai.assert.isNotNull(this.invited_user, 'Previous step should have generated an invited user!');
    chai.assert.equal(this.invitation.email, this.invited_user.email, 'invitation should have been sent to user email!');

    //try follow valid link
    return chai
        .request(this.app)
        .post("/v1/users/invitation")
        .send({
            token: this.invitation.token
        })
        .then(result => {   

            expect(result).to.have.status(200);
            expect(result.body.invitation).to.be.not.undefined;
            expect(result.body.invitation).to.an('object');
            expect(result.body.invitation.was_used).to.be.false;

        });
});

When('I input my new password', function(done) {

    //check state valid
    chai.assert.isNotNull(this.invitation, 'Previous step should have generated a user invitation!');
    chai.assert.isNotNull(this.invited_user, 'Previous step should have generated an invited user!');
    chai.assert.equal(this.invitation.email, this.invited_user.email, 'invitation should have been sent to user email!');

    //try follow valid link
    chai
        .request(this.app)
        .post("/v1/users/create-invited")
        .send({
            invitation_id: this.invitation.id,
            password: 'pwd'
        })
        .then(result => {   

            expect(result).to.have.status(200);
            
            //response analysis in next step
            this.create_response = result;

            done();
        });
});

Then('my user is ready for use', function() {

    chai.assert.isDefined(this.create_response, 'Previous step did not record invitation repsonse!');

    const result = this.create_response;

    chai.expect(result.body.user).is.a('object');
    chai.expect(result.body.user.email).is.eq(users.invited_user.email);
    chai.expect(result.body.user.first_name).is.eq(users.invited_user.first_name);
    chai.expect(result.body.user.last_name).is.eq(users.invited_user.last_name);
    chai.expect(result.body.user.is_active).is.true;
});

Then('I am logged in to the system', async function() {

    chai.assert.isDefined(this.create_response, 'Previous step did not record invitation repsonse!');
    chai.assert.isString(this.create_response.body.token, 'No authentication token on invite response!');

    //fetch resource any role has access to
    return chai
        .request(this.app)
        .get("/v1/users/me")
        .set('Authorization', this.create_response.body.token)
        .then(result => {   

            //went through OK - means token valid
            expect(result).to.have.status(200);
            
            //response analysis in next step
            this.create_response = result;
        });
});

async function getInvitedUserId() {
    //scenario finished OK, captured invitation
    if (this.invited_user) {
        return this.invited_user.id
    }
    //user previously in system
    const user = await require('../../../models').User.findOne({
        where: {
            email: users.invited_user.email
        }
    })
    if (user) {
        return user.id
    }
    //user not present, all good
    return null
}

//This will be called after the scenario where the @user_cleanup tag is placed.
After('@user_cleanup', async function() {
    const { User, Role, UserInvitation, sequelize } = require('../../../models');

    //delete invitations
    await UserInvitation.destroy({
        where: {
            email: users.invited_user.email
        }
    });

    const invited_user_id = await getInvitedUserId()

    const to_clean_up = {
        users: [],
        roles: []
    };
    if (invited_user_id) {
        to_clean_up.users.push(invited_user_id)
    }

    for(let role in users) {
        const user_data = users[role];
        if(user_data.id) {
            to_clean_up.users.push(user_data.id);
            to_clean_up.roles.push(user_data.role.id);
        }
    }

    if(!to_clean_up.users.length) return;

    return sequelize.transaction(transaction => {
        return Role.destroy({
            where: { id: to_clean_up.roles },
            transaction
        }).then(() => {
            return User.destroy({
                where: { id: to_clean_up.users },
                transaction
            });
        })
    });
});