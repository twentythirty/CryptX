const { Given, When, Then } = require('cucumber');
const chai = require('chai');
const { expect } = chai;

const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const World = require('../support/global_world');

Given('the current Investment Run has no recipe runs', function(){

    const { RecipeRun } = require('../../../models');

    return RecipeRun.destroy({
        where: { investment_run_id: this.current_investment_run.id }
    });

});

When('I create a new Recipe Run', function(){

    return chai
        .request(this.app)
        .post(`/v1/investments/${this.current_investment_run.id}/start_recipe_run`)
        .set('Authorization', World.current_user.token)
        .then(result => {   
            
            expect(result).to.have.status(200);
            expect(result.body.recipe_run).to.an('object');
            
            this.current_recipe_run = result.body.recipe_run;

        })
        .catch(error => {
            //console.error(error)
        })

});