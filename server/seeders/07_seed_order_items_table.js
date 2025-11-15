'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    async up(queryInterface, Sequelize) {
        const orders = await queryInterface.sequelize.query(`SELECT id FROM orders;`);
        const products = await queryInterface.sequelize.query(`SELECT id, price FROM products;`);
        const orderRows = orders[0];
        const productRows = products[0];

        if (orderRows.length && productRows.length) {
            await queryInterface.bulkInsert('order_items', [
                {
                    id: uuidv4(),
                    orderId: orderRows[0].id,
                    productId: productRows[0].id,
                    unitPrice: productRows[0].price, // Thay price → unitPrice
                    quantity: 2,
                    total: productRows[0].price * 2, // Tính tổng
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: uuidv4(),
                    orderId: orderRows[0].id,
                    productId: productRows[1]?.id || productRows[0].id,
                    unitPrice: productRows[1]?.price || productRows[0].price,
                    quantity: 1,
                    total: productRows[1]?.price || productRows[0].price,
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