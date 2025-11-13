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
                    price: productRows[0].price, // đúng cột trong DB
                    quantity: 1,
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
