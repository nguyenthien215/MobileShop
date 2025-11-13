'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('reviews', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            productId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            userId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            rating: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
            comment: { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('reviews');
    }
};
