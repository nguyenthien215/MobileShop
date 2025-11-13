// liên kết sản phầm khuyến mãi
'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_promotions', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            productId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            promotionId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'promotions', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('product_promotions');
    }
};
