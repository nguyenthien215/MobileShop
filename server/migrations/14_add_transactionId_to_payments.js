'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('payments', 'transactionId', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'status'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('payments', 'transactionId');
    }
};
