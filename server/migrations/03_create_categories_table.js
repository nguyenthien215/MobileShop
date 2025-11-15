'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('categories', {
            id: { type: Sequelize.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false, unique: true },
            image: { type: Sequelize.STRING, allowNull: true },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('categories');
    }
};