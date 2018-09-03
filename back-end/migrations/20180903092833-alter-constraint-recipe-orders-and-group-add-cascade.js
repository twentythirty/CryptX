'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('recipe_order', 'recipe_order_recipe_order_group_id_fkey')
      .then(() => {
        return queryInterface.addConstraint('recipe_order', ['recipe_order_group_id'], {
          type: 'foreign key',
          name: 'recipe_order_recipe_order_group_id_fkey',
          references: {
            table: 'recipe_order_group',
            field: 'id'
          },
          onDelete: 'cascade',
          onUpdate: 'cascade'
        });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('recipe_order', 'recipe_order_recipe_order_group_id_fkey')
      .then(() => {
        return queryInterface.addConstraint('recipe_order', ['recipe_order_group_id'], {
          type: 'foreign key',
          name: 'recipe_order_recipe_order_group_id_fkey',
          references: {
            table: 'recipe_order_group',
            field: 'id'
          },
          onDelete: 'no action',
          onUpdate: 'no action'
        });
      });
  }
};
