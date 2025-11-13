'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('promotions', {
            id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            code: { type: Sequelize.STRING, allowNull: false, unique: true },
            discountType: { type: Sequelize.ENUM('percent', 'fixed'), allowNull: false },
            discountValue: { type: Sequelize.FLOAT, allowNull: false },
            startDate: { type: Sequelize.DATE, allowNull: false },
            endDate: { type: Sequelize.DATE, allowNull: false },
            status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('promotions');
    }
};
