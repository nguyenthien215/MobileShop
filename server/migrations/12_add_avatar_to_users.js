'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'avatar', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
        });
    },
    async down(queryInterface) {
        await queryInterface.removeColumn('users', 'avatar');
    }
};
