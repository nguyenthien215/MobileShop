'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(`SELECT id FROM users;`);
        const products = await queryInterface.sequelize.query(`SELECT id FROM products;`);
        const userRows = users[0];
        const productRows = products[0];

        await queryInterface.bulkInsert('cart_items', [
            { userId: userRows[0].id, productId: productRows[0].id, quantity: 1, createdAt: new Date(), updatedAt: new Date() },
            { userId: userRows[1].id, productId: productRows[1].id, quantity: 2, createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('cart_items', null, {});
    }
};
