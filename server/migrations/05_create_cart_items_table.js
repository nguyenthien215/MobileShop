// giỏ hàng
'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('cart_items', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            userId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            productId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('cart_items');
    }
};
