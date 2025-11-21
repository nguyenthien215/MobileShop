'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('reviews', 'adminReply', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
        });
    },
    async down(queryInterface) {
        await queryInterface.removeColumn('reviews', 'adminReply');
    }
};
