'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('roles', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.ENUM('user', 'admin'), allowNull: false, unique: true },
            description: { type: Sequelize.STRING },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('roles');
    }
};
