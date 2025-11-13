'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: { type: Sequelize.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false, unique: true },
            description: { type: Sequelize.TEXT },
            price: { type: Sequelize.FLOAT, allowNull: false },
            stock: { type: Sequelize.INTEGER, defaultValue: 0 },
            images: { type: Sequelize.JSON },
            specs: { type: Sequelize.JSON },
            brand: { type: Sequelize.STRING },
            categoryId: {
                type: Sequelize.CHAR(36),
                allowNull: false,
                references: { model: 'categories', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        }, { engine: 'InnoDB' });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('products');
    }
};
