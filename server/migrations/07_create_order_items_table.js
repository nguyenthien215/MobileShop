// chi tiết đặt hàng
'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('order_items', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            orderId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            productId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            unitPrice: { type: Sequelize.FLOAT, allowNull: false },
            quantity: { type: Sequelize.INTEGER, allowNull: false },
            total: { type: Sequelize.FLOAT, allowNull: false },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('order_items');
    }
};
