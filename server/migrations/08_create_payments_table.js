'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payments', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            orderId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true,
                references: { model: 'orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            method: { type: Sequelize.ENUM('COD', 'bank', 'momo', 'zalopay'), allowNull: false },
            amount: { type: Sequelize.FLOAT, allowNull: false },
            status: { type: Sequelize.ENUM('paid', 'unpaid'), defaultValue: 'unpaid' },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('payments');
    }
};
