'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: { type: Sequelize.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
            name: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            passwordHash: { type: Sequelize.STRING, allowNull: false },
            role: { type: Sequelize.ENUM('user', 'admin'), defaultValue: 'user' },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('users');
    }
};
