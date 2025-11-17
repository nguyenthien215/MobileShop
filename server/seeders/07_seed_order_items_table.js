'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const [orders] = await queryInterface.sequelize.query(`SELECT id FROM orders;`);
        const [products] = await queryInterface.sequelize.query(`SELECT id, price FROM products;`);

        if (orders.length && products.length) {
            await queryInterface.bulkInsert('order_items', [
                {
                    orderId: orders[0].id,
                    productId: products[0].id,
                    unitPrice: products[0].price,
                    quantity: 2,
                    total: products[0].price * 2,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    orderId: orders[0].id,
                    productId: products[1]?.id || products[0].id,
                    unitPrice: products[1]?.price || products[0].price,
                    quantity: 1,
                    total: products[1]?.price || products[0].price,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('order_items', null, {});
    }
};