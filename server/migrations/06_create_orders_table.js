'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            orderNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
            userId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            totalAmount: { type: Sequelize.FLOAT, allowNull: false },
            status: { type: Sequelize.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'), defaultValue: 'pending' },
            shippingAddress: { type: Sequelize.JSON, allowNull: false },
            paymentMethod: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('orders');
    }
};
