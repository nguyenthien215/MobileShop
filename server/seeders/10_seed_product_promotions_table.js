'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        const products = await queryInterface.sequelize.query(`SELECT id FROM products;`);
        const promotions = await queryInterface.sequelize.query(`SELECT id FROM promotions;`);
        const productRows = products[0];
        const promotionRows = promotions[0];

        await queryInterface.bulkInsert('product_promotions', [
            { productId: productRows[0].id, promotionId: promotionRows[0].id, createdAt: new Date(), updatedAt: new Date() },
            { productId: productRows[1].id, promotionId: promotionRows[1].id, createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('product_promotions', null, {});
    }
};
